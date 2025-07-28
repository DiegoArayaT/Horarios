<script setup>
const props = defineProps({
  currentView: String,
  views: Array,
  itemsList: Array
});
const emit = defineEmits(['update:view', 'drag']);

function onDragStart(item, event) {
  emit('drag', item, event);
}
</script>

<template>
  <div class="sidebar">
    <select v-model="props.currentView" @change="emit('update:view', $event.target.value)" class="sidebar-select">
      <option v-for="v in props.views" :key="v" :value="v">{{ v }}</option>
    </select>
    <div class="sidebar-table">
      <div class="sidebar-row sidebar-row-header">
        <span>Nombre</span>
        <span v-if="props.currentView === 'Clases'">Código</span>
        <span v-else>Detalle</span>
      </div>
      <div
        v-for="item in props.itemsList"
        :key="item.id"
        class="sidebar-row"
        draggable="true"
        @dragstart="onDragStart(item, $event)"
      >
        <span>{{ item.name }}</span>
        <span v-if="props.currentView === 'Clases'">{{ item.code || '' }}</span>
        <span v-else>Detalle</span>
      </div>
    </div>
  </div>
</template>
