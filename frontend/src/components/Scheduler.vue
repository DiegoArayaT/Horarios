<template>
  <div class="scheduler">
    <div class="header">
      <select v-model="currentView">
        <option v-for="v in views" :key="v" :value="v">{{ v }}</option>
      </select>
    </div>
    <div class="content">
      <div class="sidebar">
        <div
          v-for="item in items[currentView]"
          :key="item.id"
          class="card"
          draggable="true"
          @dragstart="onDragStart(item, $event)"
        >
          {{ item.name }}
        </div>
      </div>
      <table class="schedule">
        <thead>
          <tr>
            <th></th>
            <th v-for="(c, ci) in cols" :key="ci">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(day, ri) in rows" :key="ri">
            <th>{{ day }}</th>
            <td
              v-for="(c, ci) in cols"
              :key="ci"
              class="cell"
              @dragover.prevent
              @drop="onDrop(ri, ci, $event)"
            >
              <span v-if="schedule[currentView][ri][ci]">
                {{ schedule[currentView][ri][ci].name }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

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

function emptyGrid() {
  return Array(rows.length)
    .fill(null)
    .map(() => Array(cols.length).fill(null))
}

const schedule = reactive({
  Clases: emptyGrid(),
  Profesores: emptyGrid(),
  Salas: emptyGrid()
})

function onDragStart(item, evt) {
  evt.dataTransfer.setData('application/json', JSON.stringify(item))
}

function onDrop(r, c, evt) {
  const data = evt.dataTransfer.getData('application/json')
  if (data) {
    schedule[currentView.value][r][c] = JSON.parse(data)
  }
}
</script>

<style scoped>
.scheduler {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.header {
  text-align: left;
}
.content {
  display: flex;
  gap: 1rem;
}
.sidebar {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.card {
  padding: 0.5rem;
  background: #e5e5e5;
  color: #000;
  border-radius: 4px;
  cursor: grab;
}
.schedule {
  border-collapse: collapse;
}
.schedule th,
.schedule td {
  border: 1px solid #888;
  width: 80px;
  height: 40px;
  text-align: center;
}
.cell {
  background: #fff;
}
</style>
