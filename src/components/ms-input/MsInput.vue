<template>
  <div class="ms__input__wrapper">
    <div class="input-label">
      {{ props.label }}<span class="required" v-if="required">&nbsp;*</span>
    </div>
    <div class="input-tooltip-wrapper" v-tooltip.bottom="errorMessage || null">
      <input
        ref="inputEl"
        type="text"
        v-model="internalValue"
        :class="{ 'input-error': errorMessage }"
        @blur="onBlur"
        :placeholder="placeholder"
        :maxlength="maxlength"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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
  maxlength: {
    type: Number,
    default: 255,
  },
})

const emit = defineEmits(['update:modelValue', 'blur'])
const internalValue = ref(props.modelValue ?? '')
const localErrorMessage = ref('')
const errorMessage = computed(() => props.error || localErrorMessage.value)

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => props.modelValue,
  (value) => {
    internalValue.value = value ?? ''
    if (value && localErrorMessage.value) {
      localErrorMessage.value = ''
    }
  },
)

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(internalValue, (value) => {
  if (localErrorMessage.value && value.trim()) {
    localErrorMessage.value = ''
  }
  emit('update:modelValue', value)
})

/**
 * nptnhan (5/6/2026) hàm on blur
 */
function onBlur() {
  if (props.required && !internalValue.value.trim()) {
    localErrorMessage.value = t('component.required', { label: props.label })
  } else {
    localErrorMessage.value = ''
  }
  emit('blur')
}
// ref tới input thật
const inputEl = ref(null)

// expose hàm focus ra ngoài
defineExpose({
  focus: () => inputEl.value?.focus(),
})
</script>

<style scoped>
.ms__input__wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  min-height: 28px;
  flex: 0 0 auto;
}
input::placeholder {
  color: #64748b;
}
input {
  height: 28px;
  border: 1px solid #d1d5db;
  outline: none;
  border-radius: 8px;
  padding: 5px 12px;
  width: 100%;
  font-size: 13px;
  flex: 1;
  color: #101828;
  box-shadow: none;
}
input:hover {
  border-color: #9ca3af;
}
input:focus {
  border-color: #0e9a62;
}
.input-error {
  border: 1px solid #f04438 !important;
}
input:-internal-autofill-selected {
  background-color: #fff !important;
}
.input-tooltip-wrapper {
  flex: 1;
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
</style>
