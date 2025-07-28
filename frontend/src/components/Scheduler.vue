<template>
  <div class="scheduler">
    <div class="header">
      <select v-model="currentView">
        <option v-for="v in views" :key="v" :value="v">{{ v }}</option>
      </select>
    </div>
    <div class="content">
      <SchedulerSidebar
        :items="items[currentView]"
        :onDragStart="onDragStart"
      />
      <ScheduleGrid
        :rows="rows"
        :cols="cols"
        :schedule="schedule"
        :currentField="currentField"
        :onDrop="onDrop"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import SchedulerSidebar from './SchedulerSidebar.vue'
import ScheduleGrid from './ScheduleGrid.vue'

const views = ['Clases', 'Profesores', 'Salas']
const currentView = ref('Clases')

const items = reactive({
  Clases: [
    { id: 1, name: 'Clase A' },
    { id: 2, name: 'Clase B' },
    { id: 3, name: 'Clase C' }
  ],
  Profesores: [
    { id: 1, name: 'Prof. Juan' },
    { id: 2, name: 'Prof. Ana' },
    { id: 3, name: 'Prof. Pedro' }
  ],
  Salas: [
    { id: 1, name: 'Sala 1' },
    { id: 2, name: 'Sala 2' },
    { id: 3, name: 'Sala 3' }
  ]
})

const rows = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const cols = ['1', '2', '3', '4', '5', '6', '7', '8']

function createCell() {
  return { class: null, professor: null, room: null }
}

function emptyGrid() {
  return Array.from({ length: rows.length }, () =>
    Array.from({ length: cols.length }, () => createCell())
  )
}

// single grid containing class, professor and room per cell
const schedule = reactive(emptyGrid())

const fieldMap = {
  Clases: 'class',
  Profesores: 'professor',
  Salas: 'room'
}

const currentField = computed(() => fieldMap[currentView.value])

function onDragStart(item, evt) {
  evt.dataTransfer.setData('application/json', JSON.stringify(item))
}

function onDrop(r, c, evt) {
  const data = evt.dataTransfer.getData('application/json')
  if (data) {
    const item = JSON.parse(data)
    schedule[r][c][currentField.value] = item
  }
}
</script>

<style scoped src="./Scheduler.css"></style>
