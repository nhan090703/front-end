<template>
  <div class="card flex justify-center">
    <Checkbox v-model="modelValue" binary />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Checkbox from 'primevue/checkbox'

const modelValue = defineModel()
</script>

<style scoped>
:deep(.p-checkbox-box) {
  height: 16px;
  width: 16px;
  border: 1.5px solid #d5d7da;
  border-radius: 2px;
}
:deep(.p-checkbox.p-component:hover .p-checkbox-box) {
  border-color: #0e9a62 !important;
}
:deep(.p-checkbox-input) {
  height: 16px;
  width: 16px;
  outline: none;
  border: none;
}
:deep(.p-checkbox.p-component) {
  height: 16px;
  width: 16px;
}

:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box) {
  background-color: #0e9a76 !important;
  border-color: #0e9a76 !important;
  border-radius: 2px;
}
:deep(.p-checkbox .p-checkbox-icon) {
  width: 12px;
  height: 12px;
}

</style>
