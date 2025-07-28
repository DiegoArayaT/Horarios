<template>
  <div class="schedule-table-wrapper">
    <table class="schedule-table">
      <thead>
        <tr>
          <th class="hours-header">Hours</th>
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
            @drop="$emit('cell-drop', tIndex, dIndex, $event)"
          >
            <div v-if="schedule[tIndex][dIndex].class" class="cell-item class-item">
              {{ schedule[tIndex][dIndex].class.name }}
              <span v-if="schedule[tIndex][dIndex].class.code">({{ schedule[tIndex][dIndex].class.code }})</span>
            </div>
            <div v-if="schedule[tIndex][dIndex].professor" class="cell-item professor-item">
              {{ schedule[tIndex][dIndex].professor.name }}
            </div>
            <div v-if="schedule[tIndex][dIndex].room" class="cell-item room-item">
              {{ schedule[tIndex][dIndex].room.name }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps(['days', 'timeslots', 'schedule'])
const emits = defineEmits(['cell-drop'])
</script>
