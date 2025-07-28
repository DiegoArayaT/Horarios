<script setup>
const props = defineProps({
  days: Array,
  timeslots: Array,
  schedule: Array
});
const emit = defineEmits(['drop']);
function handleDrop(slotIndex, dayIndex, event) {
  emit('drop', slotIndex, dayIndex, event);
}
</script>

<template>
  <div class="schedule-table-wrapper">
    <table class="schedule-table">
      <thead>
        <tr>
          <th class="hours-header">Horas</th>
          <th v-for="day in props.days" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, tIndex) in props.timeslots" :key="tIndex">
          <th class="hours-cell">{{ time }}</th>
          <td
            v-for="(day, dIndex) in props.days"
            :key="dIndex"
            class="schedule-cell"
            @dragover.prevent
            @drop="handleDrop(tIndex, dIndex, $event)"
          >
            <div v-if="props.schedule[tIndex][dIndex].class" class="cell-item class-item">
              {{ props.schedule[tIndex][dIndex].class.name }}
              <span v-if="props.schedule[tIndex][dIndex].class.code">({{ props.schedule[tIndex][dIndex].class.code }})</span>
            </div>
            <div v-if="props.schedule[tIndex][dIndex].room" class="cell-item room-item">
              {{ props.schedule[tIndex][dIndex].room.name }}
            </div>
            <div v-if="props.schedule[tIndex][dIndex].professor" class="cell-item professor-item">
              {{ props.schedule[tIndex][dIndex].professor.name }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
