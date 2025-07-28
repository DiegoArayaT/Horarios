<template>
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
          <span v-if="schedule[ri][ci][currentField]">
            {{ schedule[ri][ci][currentField].name }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  cols: Array,
  rows: Array,
  schedule: Array,
  currentField: String,
  onDrop: Function
});
</script>

<style scoped src="./Scheduler.css"></style>
