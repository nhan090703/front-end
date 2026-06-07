<template>
  <div class="ms-radio-wrapper">
    <div class="input-label">
      {{ props.label }}<span class="required" v-if="required">&nbsp;*</span>
    </div>
    <div class="radio-content" :class="{ 'radio-error': error }" v-tooltip.bottom="error || null">
      <label v-for="option in options" :key="String(option.value)" class="radio-option">
        <input
          type="radio"
          :name="radioName"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="emit('update:modelValue', option.value)"
        />
        <span class="radio-mark"></span>
        <span>{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
  label: String,
  error: String,
  options: Array,
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const radioName = `ms-radio-${getCurrentInstance()?.uid}`
/**
 * nptnhan (5/6/2026) hàm tính options
 */
const options = computed(() =>
  props.options || [
    { label: t('common.active'), value: true },
    { label: t('common.inactive'), value: false },
  ],
)
</script>

<style scoped>
.ms-radio-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 28px;
  flex: 0 0 auto;
}

.required {
  color: #d92d20;
}
.input-label {
  font-size: 13px;
  white-space: nowrap;
  width: 150px;
  flex: 0 0 150px;
  font-weight: 500;
  line-height: 28px;
}
.radio-content {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 28px;
  flex: 1;
  min-width: 0;
}
.radio-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #101828;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
}
.radio-option input {
  position: absolute;
  left: 0;
  top: 50%;
  width: 16px;
  height: 16px;
  margin: 0;
  opacity: 0;
  transform: translateY(-50%);
  pointer-events: none;
}
.radio-mark {
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  background-color: #fff;
  position: relative;
  flex-shrink: 0;
}
.radio-option:hover .radio-mark {
  border-color: #0e9a62;
}
.radio-option input:checked + .radio-mark {
  border-color: #0e9a62;
}
.radio-option input:checked + .radio-mark::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0e9a62;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.radio-error .radio-mark {
  border-color: #f04438;
}
</style>
