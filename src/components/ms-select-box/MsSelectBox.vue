<template>
  <div class="card flex justify-center">
    <Select
      v-model="modelValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      class="w-full md:w-56"
      :disabled="isDisable"
      checkmark
    >
      <template #value>
        <span class="select-label-tooltip" v-tooltip.top="selectedLabel || null">
          {{ selectedLabel || placeholder }}
        </span>
      </template>
    </Select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'

const modelValue = defineModel()
const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  optionLabel: {
    type: String,
    default: 'name',
  },
  optionValue: {
    type: String,
    default: 'id',
  },
  placeholder: {
    type: String,
    default: '',
  },
  isDisable: {
    type: Boolean,
    default: false,
  },
})

/**
 * nptnhan (5/6/2026) hàm tính selected label
 */
const selectedLabel = computed(() => {
  const selectedOption = props.options.find((option) => {
    const optionValue = props.optionValue ? option?.[props.optionValue] : option
    return optionValue === modelValue.value
  })

  if (!selectedOption) {
    return ''
  }

  return props.optionLabel ? String(selectedOption?.[props.optionLabel] ?? '') : String(selectedOption)
})
</script>

<style scoped>
:deep(.p-select) {
  height: 28px !important;
  min-height: 28px !important;
  display: flex;
  align-items: center;
  border: 1px solid #D1D5DB !important;
  width: 100% !important;
  padding: 5px 8px 5px 12px;
  border-radius: 8px !important;
  outline: none !important;
}
:deep(.p-select.p-select-label){
  padding: 0px !important;
}
:deep(.p-select:hover) {
   border: 1px solid #9ca3af !important;
}
:deep(.p-select .p-select-label) {
  height: 32px !important;
  display: flex;
  align-items: center;
  font-size: 13px !important;
  padding: 8px 0px 8px 0px !important;
  min-width: 0;
}
.select-label-tooltip {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.p-select.p-inputwrapper-focus) {
  border: 1px solid #0e9a62 !important;
}
:deep(.p-select-dropdown .p-icon) {
  display: none;
}
:deep(.p-select-dropdown) {
  -webkit-mask-image: url("https://qtsxcdng2.misacdn.net/assets/pas.Icon Warehouse-e29a964d.svg?v=12.1.0.3");
  -webkit-mask-position: -202px -18px;
  -webkit-mask-repeat: no-repeat;
  width: 16px;
  height: 16px;
  min-width: 16px;
  background-color: #4b5563;
  justify-content: center;
  align-self: center;
  transition: all .2s ease;
}
:deep(.p-select.p-select-open .p-select-dropdown) {
   -webkit-mask-image: url("https://qtsxcdng2.misacdn.net/assets/pas.Icon Warehouse-e29a964d.svg?v=12.1.0.3");
  -webkit-mask-position: -202px -18px;
  -webkit-mask-repeat: no-repeat;
  width: 16px;
  height: 16px;
  background-color: #4b5563;
  -webkit-transform: rotate(-180deg);
  justify-content: center;
  align-self: center;
}
:global(.p-select-list){
  padding:  2px 0px !important;
  
}
:global(.p-select-overlay) {
  border-radius: 8px !important;
  border: 1px solid #d5d7da !important ;
  margin-top: -6px !important;
  font-size: 13px !important;
}
:global(.p-select-option) {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}
:global(.p-select-option-label) {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
:global(.p-select-option-check-icon),
:global(.p-select-option-blank-icon) {
  order: 2 !important;
  margin-inline-start: auto !important;
  margin-inline-end: 0 !important;
  color: #0e9a62 !important;
  width: 12px !important;
  height: 12px !important;
}
:global(.p-select-option.p-select-option-selected) {
  background: #cdeadf !important;
  color: #0e9a62 !important;
}
:deep(.p-select.p-disabled) {
  background-color: #f5f5f5 !important; /* nền xám nhạt */
  color: #999 !important;               /* chữ xám */
  border-color: #d5d7da !important;     /* viền nhạt */
  cursor: not-allowed !important;       /* con trỏ bị khóa */
}
</style>
