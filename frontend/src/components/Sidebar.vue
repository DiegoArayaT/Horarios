<template>
  <div class="sidebar">
    <select v-model="localView" class="sidebar-select" @change="$emit('update-view', localView)">
      <option v-for="v in views" :key="v" :value="v">{{ v }}</option>
    </select>
    <div class="sidebar-table">
      <div class="sidebar-row sidebar-row-header">
        <span>Name</span>
        <span v-if="localView==='Clases'">Code</span>
        <span v-else>Detail</span>
      </div>
      <div
        v-for="item in itemsList"
        :key="item.id"
        class="sidebar-row"
        draggable="true"
        @dragstart="$emit('drag-start', item, $event)"
      >
        <span>{{ item.name }}</span>
        <span v-if="localView==='Clases'">{{ item.code || '' }}</span>
        <span v-else>Detail</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps(['views', 'currentView', 'itemsList'])
const emits = defineEmits(['update-view', 'drag-start'])
const localView = ref(props.currentView)
watch(() => props.currentView, (val) => localView.value = val)
</script>
