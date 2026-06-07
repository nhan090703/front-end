<template>
  <div class="ms-date-picker-wrapper" ref="wrapperRef">
    <div v-if="label || required" class="input-label" :class="{ 'width-175': width175 }">
      {{ props.label }}<span class="required" v-if="required">&nbsp;*</span>
    </div>
    <div
      class="picker"
      :class="{ 'picker-error': errorMessage }"
      v-tooltip.bottom="errorMessage || null"
    >
      <div class="input-wraper">
        <input
          type="text"
          v-model="internalValue"
          placeholder="HH:MM"
          @input="onInput"
          @blur="onBlur"
          @keydown="onKeyDown"
          inputmode="numeric"
        />
      </div>
      <div class="icon-time" @click.stop="toggleDropdown"></div>

      <div v-if="showDropdown" class="time-dropdown">
        <div
          class="time-item"
          v-for="(t, index) in times"
          :key="t"
          :ref="(el) => setTimeItemRef(el, index)"
          @click.stop="selectTime(t)"
          :class="{ selected: internalValue === t, highlighted: highlightedIndex === index }"
        >
          {{ t }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  modelValue: String,
  label: String,
  error: String,
  required: {
    type: Boolean,
    default: false,
  },
  width175: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'blur'])

const showDropdown = ref(false)
const wrapperRef = ref(null)
const timeItemRefs = ref([])
const highlightedIndex = ref(-1)
/**
 * nptnhan (5/6/2026) hàm normalize time
 */
const normalizeTime = (value) => {
  if (!value) return ''
  return String(value).slice(0, 5)
}

const internalValue = ref(normalizeTime(props.modelValue))
const errorMessage = ref('')
/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi lỗi từ component cha
 */
watch(
  () => props.error,
  (val) => {
    errorMessage.value = val || ''
  },
)
/**
 * nptnhan (5/6/2026) hàm on input
 */
function onInput(e) {
  if (errorMessage.value && e.target.value.trim()) {
    errorMessage.value = ''
  }

  const raw = e.target.value || ''
  let digits = raw.replace(/\D/g, '')
  if (digits.length > 4) digits = digits.slice(0, 4)

  if (digits.length >= 1 && digits[0] > '2') {
    digits = digits[0]
  }

  if (digits.length >= 2) {
    const hour = parseInt(digits.slice(0, 2), 10)
    if (hour > 23) {
      digits = digits[0] === '2' ? '23' : digits[0]
    }
  }

  if (digits.length >= 3 && digits[2] > '5') {
    digits = digits.slice(0, 2) + '5' + digits.slice(3)
  }

  if (digits.length === 4) {
    const minute = parseInt(digits.slice(2, 4), 10)
    if (minute > 59) {
      digits = digits.slice(0, 2) + '59'
    }
  }

  const formatted = digits.length <= 2 ? digits : digits.slice(0, 2) + ':' + digits.slice(2)
  internalValue.value = formatted
}

/**
 * nptnhan (5/6/2026) hàm on blur
 */
function onBlur() {
  if (props.required && !internalValue.value) {
    errorMessage.value = t('component.required', { label: props.label })
  } else {
    errorMessage.value = ''
  }
  emit('blur')
}

/**
 * nptnhan (5/6/2026) hàm on key down
 */
function onKeyDown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!showDropdown.value) {
      openDropdown()
      return
    }
    moveHighlight(1)
    return
  }

  if (e.key === 'ArrowUp') {
    if (!showDropdown.value) return
    e.preventDefault()
    moveHighlight(-1)
    return
  }

  if (e.key === 'Enter') {
    if (!showDropdown.value || highlightedIndex.value < 0) return
    e.preventDefault()
    selectTime(times.value[highlightedIndex.value])
    return
  }

  // allow control keys
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (e.ctrlKey || e.metaKey) return
  if (allowed.includes(e.key)) return
  // only digits
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => props.modelValue,
  (v) => {
    internalValue.value = normalizeTime(v)
    if (v && errorMessage.value) {
      errorMessage.value = ''
    }
  },
)

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(internalValue, (v) => {
  emit('update:modelValue', v)
  if (errorMessage.value && v) {
    errorMessage.value = ''
  }
})

/**
 * nptnhan (5/6/2026) hàm tính times
 */
const times = computed(() => {
  const list = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      list.push(`${hh}:${mm}`)
    }
  }
  return list
})

/**
 * nptnhan (5/6/2026) hàm toggle dropdown
 */
function toggleDropdown() {
  if (showDropdown.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

/**
 * nptnhan (5/6/2026) hàm select time
 */
function selectTime(t) {
  internalValue.value = t
  emit('update:modelValue', t)
  closeDropdown()
}

/**
 * nptnhan (5/6/2026) hàm open dropdown
 */
function openDropdown() {
  showDropdown.value = true
  highlightedIndex.value = getCurrentTimeIndex()
  scrollHighlightedIntoView()
}

/**
 * nptnhan (5/6/2026) hàm close dropdown
 */
function closeDropdown() {
  showDropdown.value = false
  highlightedIndex.value = -1
  timeItemRefs.value = []
}

/**
 * nptnhan (5/6/2026) hàm get current time index
 */
function getCurrentTimeIndex() {
  const currentIndex = times.value.findIndex((time) => time === internalValue.value)
  return currentIndex >= 0 ? currentIndex : 0
}

/**
 * nptnhan (5/6/2026) hàm move highlight
 */
function moveHighlight(step) {
  if (!times.value.length) return
  const currentIndex = highlightedIndex.value < 0 ? getCurrentTimeIndex() : highlightedIndex.value
  highlightedIndex.value = (currentIndex + step + times.value.length) % times.value.length
  scrollHighlightedIntoView()
}

/**
 * nptnhan (5/6/2026) hàm scroll highlighted into view
 */
function scrollHighlightedIntoView() {
  nextTick(() => {
    timeItemRefs.value[highlightedIndex.value]?.scrollIntoView({
      block: 'nearest',
    })
  })
}

/**
 * nptnhan (5/6/2026) hàm set time item ref
 */
function setTimeItemRef(el, index) {
  if (el) {
    timeItemRefs.value[index] = el
  }
}

/**
 * nptnhan (5/6/2026) hàm on click outside
 */
function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    closeDropdown()
  }
}

/**
 * nptnhan (5/6/2026) hàm xử lý khi component được khởi tạo
 */
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.ms-date-picker-wrapper {
  width: 100%;
  display: flex;
  gap: 16px;
  align-items: center;
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
input {
  border: none;
  outline: none;
  padding: 0;
  width: 78px !important ;
  font-size: 13px;
  font-weight: 400;
  color: #101828;
}
.picker {
  display: flex;
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 5px 0px 5px 12px;
  height: 28px;
  align-items: center;
  gap: 4px;
  max-width: 122px;
  flex: 1;
  position: relative;
}
.picker:hover {
  border-color: #9ca3af;
}
.picker:focus-within {
  border-color: #0e9a62;
}
.picker-error,
.picker-error:hover,
.picker-error:focus-within {
  border-color: #f04438;
}
.icon-time {
  mask-image: url('https://demoqtsxcdn.misacdn.net/assets/pas.ic_time-af72a219.svg?v=12.1.0.4');
  -webkit-mask-image: url('https://demoqtsxcdn.misacdn.net/assets/pas.ic_time-af72a219.svg?v=12.1.0.4');
  /* -webkit-mask-position: -288px 0px; */
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  width: 16px;
  height: 16px;
  margin-right: 10px;
}
.width-175 {
  width: 175px;
  flex: 0 0 175px;
}

.time-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  width: 122px;
  max-height: 215px;
  overflow: auto;
  background: #fff;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08);
  z-index: 2000;
  padding: 12px 13px 7px 12px;
}
.time-item {
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  color: #101828;
  text-align: center;
  border-radius: 3.5px;
}
.time-item:hover {
  background: #efefef;
}
.time-item.highlighted {
  background: #efefef;
}
.time-item.selected {
  background: #0e9a62;
  color: #ffffff;
}
</style>
