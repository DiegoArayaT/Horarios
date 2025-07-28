<template>
  <div class="scheduler-container">
    <div class="scheduler-content">
      <!-- Sidebar igual Figma -->
      <div class="sidebar">
        <select v-model="currentView" class="sidebar-select">
          <option v-for="v in views" :key="v" :value="v">{{ v }}</option>
        </select>
        <div class="sidebar-table">
          <div class="sidebar-row sidebar-row-header">
            <span>Nombre</span>
            <span v-if="currentView==='Clases'">Código</span>
            <span v-else>Detalle</span>
          </div>
          <div
            v-for="item in itemsList"
            :key="item.id"
            class="sidebar-row"
            draggable="true"
            @dragstart="onDragStart(item, $event)"
          >
            <span>{{ item.name }}</span>
            <span v-if="currentView==='Clases'">{{ item.code || '' }}</span>
            <span v-else>Detalle</span>
          </div>
        </div>
      </div>

      <!-- Tabla de horario tipo Figma -->
      <div class="schedule-table-wrapper">
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="hours-header">Horas</th>
              <th v-for="day in days" :key="day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, tIndex) in timeslots" :key="tIndex">
              <th class="hours-cell">{{ time }}</th>
              <td
                v-for="(day, dIndex) in days"
                :key="dIndex"
                class="schedule-cell"
                @dragover.prevent
                @drop="onDrop(tIndex, dIndex, $event)"
              >
                <div v-if="schedule[tIndex][dIndex].class" class="cell-item class-item">
                  {{ schedule[tIndex][dIndex].class.name }}
                  <span v-if="schedule[tIndex][dIndex].class.code">({{ schedule[tIndex][dIndex].class.code }})</span>
                </div>
                <div v-if="schedule[tIndex][dIndex].room" class="cell-item room-item">
                  {{ schedule[tIndex][dIndex].room.name }}
                </div>
                <div v-if="schedule[tIndex][dIndex].professor" class="cell-item professor-item">
                  {{ schedule[tIndex][dIndex].professor.name }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

// Opciones de vista
const views = ['Clases', 'Profesores', 'Salas']
const currentView = ref('Clases')

// Días y bloques horarios
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const timeslots = [
  '08:00 - 09:30',
  '09:40 - 11:10',
  '11:20 - 12:50',
  '13:00 - 14:45',
  '14:45 - 16:15',
  '16:20 - 17:50',
  '17:55 - 19:25',
  '19:30 - 21:00'
]

// Listas de ítems para las tarjetas arrastrables
const classesList = ref([])
const teachersList = ref([])
const roomsList = ref([])

// Lista activa según vista
const itemsList = computed(() => {
  if (currentView.value === 'Clases') return classesList.value
  if (currentView.value === 'Profesores') return teachersList.value
  if (currentView.value === 'Salas') return roomsList.value
  return []
})

// Matriz 8x6 de celdas: cada una tiene class/professor/room
function createEmptyCell() {
  return { class: null, professor: null, room: null }
}
function emptyScheduleGrid() {
  return Array.from({ length: timeslots.length }, () =>
    Array.from({ length: days.length }, () => createEmptyCell())
  )
}
const schedule = reactive(emptyScheduleGrid())

onMounted(async () => {
  try {
    // 🚩 Cambia esto si tu API responde { data: [...] }
    const [classesRes, teachersRes, roomsRes, scheduleRes] = await Promise.all([
      axios.get('/api/classes'),
      axios.get('/api/teachers'),
      axios.get('/api/rooms'),
      axios.get('/api/schedule')
    ])

    // Si tu API responde { data: [...] } usa:
    // classesList.value = classesRes.data.data
    // teachersList.value = teachersRes.data.data
    // roomsList.value = roomsRes.data.data

    // Si tu API responde arrays directos usa:
    classesList.value = classesRes.data
    teachersList.value = teachersRes.data
    roomsList.value = roomsRes.data
    console.log('CLASES:', classesRes.data)
    console.log('PROFESORES:', teachersRes.data)
    console.log('SALAS:', roomsRes.data)

    // Armar mapas auxiliares por id
    const classMap = Object.fromEntries(classesList.value.map(c => [c.id, c]))
    const teacherMap = Object.fromEntries(teachersList.value.map(t => [t.id, t]))
    const roomMap = Object.fromEntries(roomsList.value.map(r => [r.id, r]))

    // Llenar matriz de horario
    for (const cell of scheduleRes.data) {
      const dayIndex = cell.day - 1
      const slotIndex = cell.slot - 1
      // Asigna objeto completo, soporta name+code para clases
      if (cell.class_id) {
        const data = classMap[cell.class_id] || { name: cell.class_name, code: cell.class_code }
        schedule[slotIndex][dayIndex].class = data
      }
      if (cell.teacher_id) {
        schedule[slotIndex][dayIndex].professor = teacherMap[cell.teacher_id] || { name: cell.teacher_name }
      }
      if (cell.room_id) {
        schedule[slotIndex][dayIndex].room = roomMap[cell.room_id] || { name: cell.room_name }
      }
    }
  } catch (error) {
    console.error("Error cargando datos del horario:", error)
  }
})

function onDragStart(item, event) {
  const data = { ...item, type: currentView.value }
  event.dataTransfer.setData('application/json', JSON.stringify(data))
}

async function onDrop(slotIndex, dayIndex, event) {
  event.preventDefault()
  const rawData = event.dataTransfer.getData('application/json')
  if (!rawData) return
  const item = JSON.parse(rawData)

  let updatePayload = { day: dayIndex + 1, slot: slotIndex + 1 }
  if (item.type === 'Clases') {
    schedule[slotIndex][dayIndex].class = item
    updatePayload.class_id = item.id
  } else if (item.type === 'Profesores') {
    schedule[slotIndex][dayIndex].professor = item
    updatePayload.teacher_id = item.id
  } else if (item.type === 'Salas') {
    schedule[slotIndex][dayIndex].room = item
    updatePayload.room_id = item.id
  }

  try {
    await axios.post('/api/schedule', updatePayload)
  } catch (error) {
    console.error("Error actualizando celda del horario:", error)
  }
}
</script>

<style scoped>
.scheduler-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0;
  color: black;
}

.scheduler-content {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 38px 0 0 0;
  width: 100vw;
}

/* Sidebar */
.sidebar {
  min-width: 220px;
  max-width: 220px;
  background: #f8f4fa;
  padding: 16px 10px;
  border-radius: 8px;
  border: 1px solid #bbb;
  height: 613.52px;
  overflow-y: auto;
  color: black;
}
.sidebar-select {
  width: 100%;
  margin-bottom: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #bbb;
  background: #f6f6f6;
  color: black;
}
.sidebar-table {
  width: 100%;
  font-size: 0.98em;
}
.sidebar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px 7px 10px;
  border-bottom: 1px solid #dedede;
  background: #fff;
  margin-bottom: 2px;
  border-radius: 5px;
  cursor: grab;
  font-family: inherit;
  font-size: 1em;
}
.sidebar-row-header {
  font-weight: bold;
  background: none;
  border-bottom: 2px solid #444;
  cursor: default;
  margin-bottom: 8px;
  color: #3d2954;
  font-size: 1.07em;
}

/* Tabla de horario */
.schedule-table-wrapper {
  background: #f7f4fa;
  border-radius: 8px;
  padding: 20px 20px 30px 20px;
  border: 1.5px solid #bbb;
  margin-right: 32px;
}

.view-selector-top {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1em;
}
.view-select {
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid #aaa;
}

.schedule-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  background: #fff;
  box-shadow: 0 1px 4px 0 #0002;
  font-size: 1em;
}
.schedule-table th, .schedule-table td {
  border: 2px solid #222;
  min-width: 105px;
  min-height: 38px;
  text-align: center;
  vertical-align: top;
  padding: 7px 3px;
  font-size: 1em;
}
.schedule-table th.hours-header, .schedule-table th.hours-cell {
  background: #f3f3f3;
  font-weight: bold;
  min-width: 110px;
  color: #222;
  font-size: 1.03em;
}
.schedule-cell {
  background: #fff;
  height: 48px;
  vertical-align: top;
}

/* Celda de contenido */
.cell-item {
  display: block;
  text-align: left;
  font-size: 0.97em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 1px;
}
.class-item { font-weight: bold; color: #2a2a2a;}
.professor-item { color: #644e9b;}
.room-item { color: #0d728b;}
</style>
