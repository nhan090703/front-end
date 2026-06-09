<template>
  <Popover ref="popoverRef" :dismissable="false" @show="$emit('show')" @hide="$emit('hide')">
    <div class="filter-popover">
      <div class="popover-header">
        <div class="popover-title">{{ t('component.popoverTitle', { field: field?.label || '' }) }}</div>
        <div class="icon-close icon16" @click="hide"></div>
      </div>

      <div class="popover-content">
        <MsSelectBox
          v-if="modeOptions.length"
          v-model="filterMode"
          :options="modeOptions"
          :placeholder="t('common.condition')"
        />
        <input
          v-if="showValueInput"
          v-model="filterValue"
          class="filter-input"
          :type="inputType"
          :inputmode="inputMode"
          :placeholder="t('common.filterValue')"
          @blur="formatNumberFilterValue"
        />
        <MsDatePicker
          v-if="field?.typeFilter?.type === 'time'"
          v-model="filterValue"
          class="filter-time-picker"
        />
        <MsSelectBox
          v-if="field?.typeFilter?.type === 'boolean'"
          v-model="filterValue"
          :options="booleanOptions"
          :placeholder="t('common.status')"
        />
      </div>

      <div class="popover-footer">
        <MsButton class="cancel-filter" @click="clearFilter">{{ t('common.clearFilter') }}</MsButton>
        <div class="btn-right">
          <MsButton class="cancel-btn" @click="hide">{{ t('common.cancel') }}</MsButton>
          <MsButton class="apply-btn" @click="applyFilter">{{ t('common.apply') }}</MsButton>
        </div>
      </div>
    </div>
  </Popover>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Popover from 'primevue/popover'
import MsButton from '../ms-button/MsButton.vue'
import MsSelectBox from '../ms-select-box/MsSelectBox.vue'
import MsDatePicker from '../ms-date-picker/MsDatePicker.vue'
import { useI18n } from 'vue-i18n'
import { formatNumber } from '@/utils/formatter.js'

const { t } = useI18n()

const props = defineProps({
  field: {
    type: Object,
    default: null,
  },
  resetKey: {
    type: String,
    default: '',
  },
  resetVersion: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['apply', 'clear', 'show', 'hide'])

const popoverRef = ref(null)
const filterMode = ref('')
const filterValue = ref('')

/**
 * nptnhan (5/6/2026) hàm reset điều kiện lọc trong popover
 */
const resetFilterState = () => {
  filterMode.value = modeOptions.value[0]?.id || ''
  filterValue.value = ''
}

/**
 * nptnhan (5/6/2026) hàm tính mode labels
 */
const modeLabels = computed(() => ({
  contains: t('shift.filterOperators.contains'),
  not_contains: t('shift.filterOperators.not_contains'),
  starts_with: t('shift.filterOperators.starts_with'),
  ends_with: t('shift.filterOperators.ends_with'),
  eq: t('shift.filterOperators.eq'),
  neq: t('shift.filterOperators.neq'),
  gt: t('shift.filterOperators.gt'),
  lt: t('shift.filterOperators.lt'),
}))

/**
 * nptnhan (5/6/2026) hàm tính boolean options
 */
const booleanOptions = computed(() => [
  { id: true, name: t('common.active') },
  { id: false, name: t('common.inactive') },
])

/**
 * nptnhan (5/6/2026) hàm tính mode options
 */
const modeOptions = computed(() => {
  return (props.field?.typeFilter?.modes || []).map((mode) => ({
    id: mode,
    name: modeLabels.value[mode] || mode,
  }))
})

/**
 * nptnhan (5/6/2026) hàm tính show value input
 */
const showValueInput = computed(() => {
  return ['text', 'number'].includes(props.field?.typeFilter?.type)
})

/**
 * nptnhan (7/6/2026) hàm tính kiểu input theo kiểu lọc
 */
const inputType = computed(() => {
  return 'text'
})

/**
 * nptnhan (10/6/2026) hàm tính input mode theo kiểu lọc
 */
const inputMode = computed(() => {
  return props.field?.typeFilter?.type === 'number' ? 'decimal' : 'text'
})

/**
 * nptnhan (10/6/2026) hàm parse số filter có dấu phẩy thập phân
 */
const parseNumberFilterValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  const normalizedValue = String(value).trim().replace(/\./g, '').replace(',', '.')
  const numberValue = Number(normalizedValue)
  return Number.isNaN(numberValue) ? null : numberValue
}

/**
 * nptnhan (10/6/2026) hàm format input số khi lọc
 */
const formatNumberFilterValue = () => {
  if (props.field?.typeFilter?.type !== 'number') return
  const numberValue = parseNumberFilterValue(filterValue.value)
  filterValue.value = numberValue === null ? '' : formatNumber(numberValue)
}

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => props.field,
  () => {
    resetFilterState()
  },
  { immediate: true },
)

/**
 * nptnhan (5/6/2026) hàm theo dõi yêu cầu reset popover lọc
 */
watch(
  () => props.resetVersion,
  () => {
    if (!props.field) return
    if (props.resetKey === '*' || props.resetKey === props.field.key) {
      resetFilterState()
    }
  },
)

/**
 * nptnhan (5/6/2026) hàm toggle
 */
const toggle = (event) => {
  popoverRef.value?.toggle(event)
}

/**
 * nptnhan (5/6/2026) hàm hide
 */
const hide = () => {
  popoverRef.value?.hide()
}

/**
 * nptnhan (5/6/2026) hàm apply filter
 */
const applyFilter = () => {
  formatNumberFilterValue()
  emit('apply', {
    field: props.field,
    mode: filterMode.value,
    value: filterValue.value,
  })
  hide()
}

/**
 * nptnhan (5/6/2026) hàm clear filter
 */
const clearFilter = () => {
  resetFilterState()
  emit('clear', props.field)
  hide()
}

defineExpose({
  toggle,
  hide,
  resetFilterState,
})
</script>

<style scoped>
.filter-popover {
  min-width: 350px;
  padding: 16px;
}
.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.popover-title {
  font-size: 14px;
  font-weight: 600;
  color: #101828;
}
.popover-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-input {
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 5px 12px;
  outline: none;
  font-size: 13px;
}
.filter-input:focus {
  border-color: #0e9a62;
}
.filter-time-picker {
  width: 100%;
}
.filter-time-picker :deep(.picker) {
  max-width: none;
  width: 100%;
}
.filter-time-picker :deep(input) {
  width: 100% !important;
}
.filter-time-picker :deep(.icon-time) {
  flex: 0 0 14px;
  margin-left: auto;
}
.filter-time-picker :deep(.time-dropdown) {
  width: 100%;
}
.popover-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.btn-right {
  display: flex;
  gap: 8px;
}
.cancel-filter{
    background-color: #f3f4f6;
    color: #000;
    border: none;
}
.cancel-filter:hover{
    background-color: #e5e7eb;
}
.cancel-btn {
  background-color: #fff;
  border: 1px solid #d5d7da;
  color: #101828;
}
.cancel-btn:hover{
  background-color: #f3f4f6;
}
.apply-btn {
  background-color: #0e9a62;
  color: #fff;
}
.apply-btn:hover {
  background-color: #0a724b;
}
</style>
