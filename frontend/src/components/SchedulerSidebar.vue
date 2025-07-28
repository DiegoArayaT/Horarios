<template>
  <div class="sidebar">
    <div
      v-for="item in items"
      :key="item.id"
      class="card"
      draggable="true"
      @dragstart="onDragStart(item, $event)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: Array,
  onDragStart: Function
});
</script>

<style scoped src="./Scheduler.css"></style>
