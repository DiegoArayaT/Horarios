<template>
  <div class="scheduler-container">
    <div class="scheduler-content">
      <Sidebar
        :views="views"
        :current-view="currentView"
        :items-list="itemsList"
        @update-view="val => currentView = val"
        @drag-start="onDragStart"
      />
      <ScheduleTable
        :days="days"
        :timeslots="timeslots"
        :schedule="schedule"
        @cell-drop="onDrop"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import Sidebar from './Sidebar.vue'
import ScheduleTable from './ScheduleTable.vue'
import './Scheduler.css'

// View options
const views = ['Clases', 'Profesores', 'Salas']
const currentView = ref('Classes')

// Days and timeslots
const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
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

// Lists for draggable items
const classesList = ref([])
const teachersList = ref([])
const roomsList = ref([])

// Computed items list depending on view
const itemsList = computed(() => {
  if (currentView.value === 'Clases') return classesList.value
  if (currentView.value === 'Profesores') return teachersList.value
  if (currentView.value === 'Salas') return roomsList.value
  return []
})

// 8x6 grid of schedule cells
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
    // Adapt this if your API returns { data: [...] }
    const [classesRes, teachersRes, roomsRes, scheduleRes] = await Promise.all([
      axios.get('/api/classes'),
      axios.get('/api/teachers'),
      axios.get('/api/rooms'),
      axios.get('/api/schedule')
    ])
    // Direct array response:
    classesList.value = classesRes.data
    teachersList.value = teachersRes.data
    roomsList.value = roomsRes.data

    // Build lookup maps
    const classMap = Object.fromEntries(classesList.value.map(c => [c.id, c]))
    const teacherMap = Object.fromEntries(teachersList.value.map(t => [t.id, t]))
    const roomMap = Object.fromEntries(roomsList.value.map(r => [r.id, r]))

    // Fill schedule grid
    for (const cell of scheduleRes.data) {
      const dayIndex = cell.day - 1
      const slotIndex = cell.slot - 1
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
    console.error("Error loading schedule data:", error)
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
    console.error("Error updating schedule cell:", error)
  }
}
</script>
