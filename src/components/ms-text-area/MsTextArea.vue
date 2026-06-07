<template>
  <div class="ms-text-area-wrapper">
    <div class="input-label" :class="{ 'width-175': width175 }">
      {{ props.label }}<span class="required" v-if="required">&nbsp;*</span>
    </div>
      <textarea
        :id="textareaId"
        v-model="internalValue"
        maxlength="255"
        rows="3"
        class="ms-text-area"
        :placeholder="placeholder"
      ></textarea>
  </div>
</template>
<script setup>
import { ref, useId, watch } from 'vue'
const props = defineProps({
  modelValue: String,
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
})

const emit = defineEmits(['update:modelValue'])
const textareaId = `ms-text-area-${useId()}`
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
.ms-text-area-wrapper {
  width: 100%;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  min-height: 68px;
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
.width-175 {
  width: 175px;
  flex: 0 0 175px;
}
.ms-text-area {
  background: #ffffff;
  height: 68px;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid #d5d7da;
  padding: 6px 10px;
  resize: none;
  color: #101828;
  font-size: 13px;
  font-weight: 400;
  flex: 1;
}
.ms-text-area:hover {
  border-color: #9ca3af;
}
.ms-text-area:focus {
  border-color: #0e9a62 !important;
  border: 1px solid;
  outline: none;
  box-shadow: none;
}

</style>
