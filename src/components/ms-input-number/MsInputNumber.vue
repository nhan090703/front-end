<template>
  <div class="ms-input-number-wrapper">
    <div class="input-label" :class="{ 'width-175': width175 }">
      {{ props.label }}<span class="required" v-if="required">&nbsp;*</span>
    </div>
    <div class="input-tooltip-wrapper" v-tooltip.bottom="errorMessage || null">
      <InputNumber
        class="input-number"
        :class="{ 'warning-number': warning }"
        v-model="internalValue"
        :inputId="inputId"
        :minFractionDigits="3"
        :maxFractionDigits="5"
        :prefix="warning ? '(' : ''"
        :suffix="warning ? ')' : ''"
        fluid
        disabled
      />
    </div>
  </div>
</template>

<script setup>
import { ref, useId, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
const props = defineProps({
  modelValue: [String, Number],
  label: String,
  error: String,
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  width175: {
    type: Boolean,
    default: false,
  },
  warning: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const inputId = `ms-input-number-${useId()}`
const internalValue = ref(props.modelValue ?? '')
const errorMessage = ref('')

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => props.error,
  (val) => {
    errorMessage.value = val || ''
  },
)

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => props.modelValue,
  (value) => {
    internalValue.value = value ?? ''
  },
)

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(internalValue, (value) => {
  emit('update:modelValue', value)
})
</script>

<style scoped>
.ms-input-number-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 28px;
  flex: 0 0 auto;
}

.input-label {
  font-size: 13px;
  white-space: nowrap;
  width: 150px;
  flex: 0 0 150px;
  font-weight: 500;
  line-height: 28px;
}
:deep(.input-number) {
  flex: 1;
}
:deep(.p-inputnumber .p-inputnumber-input) {
  height: 28px !important;
  line-height: 32px !important;
  text-align: right;
  font-size: 13px;
  border-radius: 8px;
  max-width: 122px !important;
  padding: 5px 12px !important;
  box-shadow: none !important;
  border: 1px solid #d1d5db;
}
.width-175 {
  width: 175px;
  flex: 0 0 175px;
}

:deep(.p-inputnumber .p-inputnumber-input:hover) {
  border-color: #9ca3af;
}
:deep(.p-inputnumber .p-inputnumber-input:focus) {
  border-color: #0e9a62;
}

:deep(.p-inputnumber .p-inputnumber-input:disabled),
:deep(.p-inputnumber .p-inputnumber-input[disabled]) {
  background-color: #f3f4f6 !important;
  border-color: #d5d7da !important;
  cursor: not-allowed;
}

:deep(.warning-number .p-inputnumber-input),
:deep(.warning-number .p-inputnumber-input:disabled),
:deep(.warning-number .p-inputnumber-input[disabled]) {
  color: #f04438 !important;
}
</style>
