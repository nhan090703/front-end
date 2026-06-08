<template>
  <div class="ms__table">
    <table>
      <thead>
        <tr>
          <th class="col__check__box">
            <div class="th-content">
              <MsCheckBox :modelValue="allSelected" @update:modelValue="toggleAllSelection" />
            </div>
          </th>
          <th
            v-for="field in fields"
            :key="field.key"
            :class="`col__${field.key.toLowerCase()}`"
            :style="getColumnStyle(field)"
          >
            <div class="th-content">
              <div class="menu-wrapper">
                <span class="header-label">{{ field.label }}</span>
                <div
                  v-if="field.typeFilter"
                  :class="['icon-filter', { 'icon-filter-active': isFilterPopoverActive(field) }]"
                  @click.stop="toggleFilter($event, field)"
                ></div>
              </div>
              <div class="ms-resize" @mousedown.stop.prevent="startColumnResize($event, field)"></div>
            </div>
          </th>
          <th class="col__actions"></th>
        </tr>
      </thead>

      <tbody>
        <!-- Shimmer Loading Rows -->
        <tr
          v-if="props.loading"
          v-for="i in props.pageSize || 10"
          :key="`shimmer-${i}`"
          class="shimmer-row"
        >
          <td class="col__check__box" @dblclick.stop>
            <div class="shimmer-checkbox"></div>
          </td>
          <td
            v-for="field in fields"
            :key="field.key"
            :class="`col__${field.key.toLowerCase()}`"
            :style="getColumnStyle(field)"
          >
            <div class="shimmer"></div>
          </td>
          <td class="col__actions"></td>
        </tr>

        <!-- Data Rows -->
        <tr
          v-if="!props.loading"
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          :class="['table-row', { 'selected-row': isRowSelected(row) }]"
          tabindex="0"
          @click="handleRowClick(row)"
          @dblclick="handleEdit(row)"
        >
          <td class="col__check__box">
            <MsCheckBox
              :modelValue="isRowSelected(row)"
              @update:modelValue="(checked) => toggleRowSelection(row, checked)"
            />
          </td>
          <td
            v-for="field in fields"
            :key="field.key"
            :class="[
              `col__${field.key.toLowerCase()}`,
              { 'warning-number-cell': isWarningNumberCell(row, field) },
            ]"
            :style="getColumnStyle(field)"
            @mouseenter="showCellTooltip($event, row, field)"
            @mousemove="moveCellTooltip"
            @mouseleave="hideCellTooltip"
          >
            <template v-if="field.type === 'custom'">
              <slot :name="field.key" :row="row" :field="field" :value="row[field.key]">
                {{ handleFormat(row[field.key], 'text') }}
              </slot>
            </template>
            <template v-else-if="row[field.key] === null || row[field.key] === undefined">
              <span style="color: #1e2633; font-size: 14px">-</span>
            </template>
            <template v-else>
              <span class="cell-label">{{ getCellDisplay(row, field) }}</span>
            </template>
          </td>

          <!-- ACTION COLUMN -->
          <td class="col__actions" @dblclick.stop>
            <div class="action__buttons">
              <div class="edit-btn" @click="handleEdit(row)">
                <div class="icon-edit icon16"></div>
              </div>
              <div class="option-btn" @click="toggle($event, rowIndex)">
                <div class="icon-option icon16"></div>
              </div>
              <Popover :ref="(el) => setPopover(el, rowIndex)">
                <div class="pop-over">
                  <div class="pop-over-option" @click="handleDuplicate(row, rowIndex)">
                    <div class="icon-copy icon16"></div>
                    <div class="option-label">{{ t('common.duplicate') }}</div>
                  </div>
                  <div class="pop-over-option" @click="handleToggleActive(row, rowIndex)">
                    <template v-if="row.inActive">
                      <div class="icon-empty icon16"></div>
                      <div class="option-label">{{ t('common.stopUsing') }}</div>
                    </template>
                    <template v-else>
                      <div class="icon-active icon16"></div>
                      <div class="option-label">{{ t('common.use') }}</div>
                    </template>
                  </div>
                  <div class="pop-over-option" @click="handleDelete(row, rowIndex)">
                    <div class="icon-delete icon16"></div>
                    <div class="option-label">{{ t('common.delete') }}</div>
                  </div>
                </div>
              </Popover>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <MsPopOver
      ref="filterPopoverRef"
      :field="activeFilterField"
      :reset-key="filterResetKey"
      :reset-version="filterResetVersion"
      @apply="handleApplyFilter"
      @clear="handleClearFilter"
      @show="filterPopoverVisible = true"
      @hide="handleFilterPopoverHide"
    />
    <div v-if="cellTooltip.visible" class="cell-tooltip" :style="cellTooltipStyle">
      {{ cellTooltip.text }}
    </div>
  </div>
</template>

<script setup>
import { formatNumber, formatText, formatDate, formatTime } from '@/utils/formatter'
import MsCheckBox from '../ms-check-box/MsCheckBox.vue'
import MsPopOver from '../ms-pop-over/MsPopOver.vue'
import Popover from 'primevue/popover'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const popovers = ref([])
const filterPopoverRef = ref(null)
const activeFilterField = ref(null)
const filterPopoverVisible = ref(false)
const { t } = useI18n()
const columnWidths = reactive({})
const resizingColumn = ref(null)
const resizeState = reactive({
  startX: 0,
  startWidth: 0,
  previousCursor: '',
  previousUserSelect: '',
})
const cellTooltip = reactive({
  visible: false,
  text: '',
  left: 0,
  top: 0,
})
const MIN_COLUMN_WIDTH = 80
const MAX_COLUMN_WIDTH = 600

/**
 * nptnhan (5/6/2026) hàm set popover
 */
const setPopover = (el, index) => {
  popovers.value[index] = el
}

/**
 * nptnhan (5/6/2026) hàm toggle
 */
const toggle = (event, index) => {
  popovers.value[index]?.toggle(event)
}

/**
 * nptnhan (5/6/2026) hàm toggle filter
 */
const toggleFilter = (event, field) => {
  activeFilterField.value = field
  filterPopoverRef.value?.toggle(event)
}

/**
 * nptnhan (5/6/2026) hàm is filter popover active
 */
const isFilterPopoverActive = (field) => {
  return filterPopoverVisible.value && activeFilterField.value?.key === field.key
}

/**
 * nptnhan (5/6/2026) hàm handle format
 */
const handleFormat = (value, type) => {
  switch (type) {
    case 'number':
      return formatNumber(value)
    case 'date':
      return formatDate(value)
    case 'time':
      return formatTime(value)
    case 'text':
      return formatText(value)
    default:
      return formatText(value)
  }
}

/**
 * nptnhan (5/6/2026) hàm parse number value
 */
const parseNumberValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(String(value).replace(',', '.'))
  return Number.isNaN(numberValue) ? null : numberValue
}

/**
 * nptnhan (5/6/2026) hàm is warning number cell
 */
const isWarningNumberCell = (row, field) => {
  if (field.key !== 'workingTime') return false

  const workingTime = parseNumberValue(row.workingTime)
  const breakingTime = parseNumberValue(row.breakingTime)
  return workingTime !== null && breakingTime !== null && workingTime < breakingTime
}

/**
 * nptnhan (5/6/2026) hàm handle cell display
 */
const handleCellDisplay = (row, field) => {
  const formattedValue = handleFormat(row[field.key], field.type || 'text')
  return isWarningNumberCell(row, field) ? `(${formattedValue})` : formattedValue
}

/**
 * nptnhan (5/6/2026) hàm get cell display
 */
const getCellDisplay = (row, field) => {
  return handleCellDisplay(row, field)
}

/**
 * nptnhan (5/6/2026) hàm tính cell tooltip style
 */
const cellTooltipStyle = computed(() => ({
  left: `${cellTooltip.left}px`,
  top: `${cellTooltip.top}px`,
}))

/**
 * nptnhan (5/6/2026) hàm update cell tooltip position
 */
const updateCellTooltipPosition = (event) => {
  const offset = 12
  cellTooltip.left = event.clientX + offset
  cellTooltip.top = event.clientY + offset
}

/**
 * nptnhan (5/6/2026) hàm show cell tooltip
 */
const showCellTooltip = (event, row, field) => {
  if (field.type === 'custom') return
  if (row[field.key] === null || row[field.key] === undefined) return

  const text = getCellDisplay(row, field)
  if (!text) return

  cellTooltip.text = text
  cellTooltip.visible = true
  updateCellTooltipPosition(event)
}

/**
 * nptnhan (5/6/2026) hàm move cell tooltip
 */
const moveCellTooltip = (event) => {
  if (!cellTooltip.visible) return
  updateCellTooltipPosition(event)
}

/**
 * nptnhan (5/6/2026) hàm hide cell tooltip
 */
const hideCellTooltip = () => {
  cellTooltip.visible = false
  cellTooltip.text = ''
}

/**
 * nptnhan (5/6/2026) hàm get column style
 */
const getColumnStyle = (field) => {
  const width = columnWidths[field.key]
  return width
    ? {
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
      }
    : null
}

/**
 * nptnhan (5/6/2026) hàm start column resize
 */
const startColumnResize = (event, field) => {
  const th = event.currentTarget.closest('th')
  if (!th) return

  resizingColumn.value = field.key
  resizeState.startX = event.clientX
  resizeState.startWidth = th.offsetWidth
  resizeState.previousCursor = document.body.style.cursor
  resizeState.previousUserSelect = document.body.style.userSelect
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  window.addEventListener('mousemove', resizeColumn)
  window.addEventListener('mouseup', stopColumnResize)
}

/**
 * nptnhan (5/6/2026) hàm resize column
 */
const resizeColumn = (event) => {
  if (!resizingColumn.value) return

  const delta = event.clientX - resizeState.startX
  const width = Math.min(
    Math.max(resizeState.startWidth + delta, MIN_COLUMN_WIDTH),
    MAX_COLUMN_WIDTH,
  )
  columnWidths[resizingColumn.value] = width
}

/**
 * nptnhan (5/6/2026) hàm stop column resize
 */
const stopColumnResize = () => {
  if (!resizingColumn.value) return

  resizingColumn.value = null
  document.body.style.cursor = resizeState.previousCursor
  document.body.style.userSelect = resizeState.previousUserSelect
  window.removeEventListener('mousemove', resizeColumn)
  window.removeEventListener('mouseup', stopColumnResize)
}

//prop row, field
const props = defineProps({
  fields: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((field) => {
        const validTypes = ['text', 'number', 'date', 'time', 'custom']
        return field.key && field.label && validTypes.includes(field.type || 'text')
      })
    },
  },
  rows: {
    type: Array,
    required: true,
  },
  selectedKeys: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'shiftId',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  filterResetKey: {
    type: String,
    default: '',
  },
  filterResetVersion: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'edit',
  'delete',
  'duplicate',
  'select',
  'select-all',
  'clear-selection',
  'toggle-active',
  'filter',
  'clear-filter',
  'row-click',
])

/**
 * nptnhan (5/6/2026) hàm tính all selected
 */
const allSelected = computed(() => {
  if (!props.rows.length) return false
  return props.rows.every((row) => isRowSelected(row))
})

/**
 * nptnhan (5/6/2026) hàm get row key
 */
const getRowKey = (row) => {
  return row?.[props.rowKey] || row?.shiftId || row?.ShiftId || row?.id
}

/**
 * nptnhan (5/6/2026) hàm is row selected
 */
const isRowSelected = (row) => {
  return props.selectedKeys.includes(getRowKey(row))
}

/**
 * nptnhan (5/6/2026) hàm handle edit
 */
const handleEdit = (row) => {
  emit('edit', row)
}

/**
 * nptnhan (8/6/2026) hàm handle row click
 */
const handleRowClick = (row) => {
  emit('row-click', row)
}

/**
 * nptnhan (5/6/2026) hàm toggle all selection
 */
const toggleAllSelection = (value) => {
  if (value) {
    emit('select-all', props.rows)
  } else {
    emit('clear-selection')
  }
}

/**
 * nptnhan (5/6/2026) hàm toggle row selection
 */
const toggleRowSelection = (row, checked) => {
  emit('select', {
    row,
    selected: checked,
  })
}

/**
 * nptnhan (5/6/2026) hàm handle toggle active
 */
const handleToggleActive = (row, index) => {
  popovers.value[index]?.hide?.()
  emit('toggle-active', row)
}

/**
 * nptnhan (5/6/2026) hàm handle delete
 */
const handleDelete = (row, index) => {
  popovers.value[index]?.hide?.()
  emit('delete', row)
}

/**
 * nptnhan (5/6/2026) hàm handle duplicate
 */
const handleDuplicate = (row, index) => {
  popovers.value[index]?.hide?.()
  emit('duplicate', row)
}

/**
 * nptnhan (5/6/2026) hàm handle apply filter
 */
const handleApplyFilter = (filter) => {
  emit('filter', filter)
}

/**
 * nptnhan (5/6/2026) hàm handle clear filter
 */
const handleClearFilter = (field) => {
  emit('clear-filter', field)
}

/**
 * nptnhan (5/6/2026) hàm handle filter popover hide
 */
const handleFilterPopoverHide = () => {
  filterPopoverVisible.value = false
}

onBeforeUnmount(() => {
  stopColumnResize()
  hideCellTooltip()
})
</script>

<style scoped>
.ms__table {
  width: 100%;
  position: relative;
}

table {
  border-collapse: collapse;
  table-layout: fixed;

  width: max-content;
}
thead {
  background: #f9fafb;
  height: 33px;
  font-size: 13px;
}
th {
  font-weight: 400;
  background: #f3f4f6;
  border-bottom: 1px solid #d1d5db;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
}
tr {
  height: 32px;
  color: #101828;
}
td {
  padding: 0px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  overflow: hidden;
}
td.warning-number-cell {
  color: #f04438;
}
.cell-label {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cell-tooltip {
  position: fixed;
  z-index: 10000;
  max-width: 360px;
  padding: 3px 10px;
  border-radius: 2px;
  background-color: #505050;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  box-shadow: 0 2px 8px #00000026;
  pointer-events: none;
  white-space: normal;
  overflow-wrap: anywhere;
}
.th-content {
  display: flex;
  padding: 0 16px;
  border-right: 1px solid #d1d5db;
  align-items: center;
  width: 100%;
  position: relative;
}
.menu-wrapper {
  display: flex;
  align-items: center;
  font-weight: 600;
  text-overflow: ellipsis;
  width: 100%;
  min-width: 0;
}
.header-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
.ms-resize {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 20;
}
.ms-resize:hover::after {
  content: '';
  position: absolute;
  top: 0;
  right: 3px;
  width: 2px;
  height: 100%;
  background-color: #0e9a62;
}
th.col__check__box {
  width: 40px;
  position: sticky;
  left: 0;
  top: 0;
  z-index: 50;
  background: #f3f4f6;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}

td.col__check__box {
  width: 40px;
  position: sticky;
  left: 0;
  z-index: 5;
  background: #fff;
}

tbody tr .col__check__box {
  background-color: #fff;
  padding: 0;
  text-align: center;
  left: 0;
  z-index: 5;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}

th.col__actions {
  width: 100px;
  position: sticky;
  right: 0;
  top: 0;
  z-index: 45;
  background-color: #f3f4f6;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.05);
}

td.col__actions {
  width: 100px;
  position: sticky;
  right: 0;
  z-index: 5;
  background-color: white;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.05);
  padding-left: 8px;
}

tbody tr:hover td {
  background-color: #e5e7eb;
}

tbody tr:hover .col__actions {
  background-color: #e5e7eb;
}

tbody tr.selected-row td,
tbody tr.selected-row .col__check__box,
tbody tr.selected-row .col__actions,
tbody tr.selected-row:hover td,
tbody tr.selected-row:hover .col__check__box,
tbody tr.selected-row:hover .col__actions {
  background-color: #a4f6d3;
}

tbody tr:focus {
  outline: none;
}

tbody tr:focus td {
  background-color: #a4f6d3;
}

tbody tr:focus .col__actions {
  background-color: #a4f6d3;
}
/* Ẩn mặc định */
.action__buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
}

/* Hover vào hàng thì hiện */
.table-row:hover .action__buttons {
  opacity: 1;
}

/* Style nút */
.edit-btn,
.option-btn {
  cursor: pointer;
  transition: all ease 0.1s;
  border-radius: 8px;
  border: solid 1px #d5d7da;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}
.edit-btn:hover .icon-edit,
.option-btn:hover .icon-option {
  background-color: #0e9a62 !important;
}
.col__check__box {
  width: 40px;
  background: #f3f4f6;
}
.col__check__box .th-content {
  display: flex;
  justify-content: center;
  padding: 0;
}
tbody tr .col__check__box {
  background-color: #fff;
  padding: 0;
  text-align: center;
}
.pop-over {
  display: flex;
  flex-direction: column;
}
.pop-over-option {
  height: 32px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  color: #101828;
  cursor: pointer;
  transition: all 0.7s ease;
  gap: 8px;
  font-size: 13px;
  font-weight: 400;
}
:global(div.p-popover-content) {
  padding: 8px 0px !important;
  border-radius: 8px !important;
}
:global(.p-popover::before),
:global(.p-popover::after),
:global(.p-popover.p-popover-flipped::before),
:global(.p-popover.p-popover-flipped::after) {
  display: none !important;
  border: 0 !important;
  content: none !important;
}
.shimmer {
  height: 16px;
  margin: 16px;
  border-radius: 2px;
  background-image: linear-gradient(
    to right,
    #ebebeb calc(50% - 100px),
    #f5f5f5 50%,
    #ebebeb calc(50% + 100px)
  );
  background-size: 200% 100%;
  position: relative;
  overflow: hidden;
  animation: shimmerAnimation 2s infinite;
}

@keyframes shimmerAnimation {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.shimmer-row {
  height: 32px;
}

.shimmer-row td {
  padding: 0;
  background-color: #fff;
}

.shimmer-checkbox {
  width: 16px;
  height: 16px;
  margin: 0 auto;
  border-radius: 2px;
  background-image: linear-gradient(
    to right,
    #ebebeb calc(50% - 100px),
    #f5f5f5 50%,
    #ebebeb calc(50% + 100px)
  );
  background-size: 200% 100%;
  animation: shimmerAnimation 2s infinite;
}

.icon-filter{
   -webkit-mask-image: url("https://demoqtsxcdn.misacdn.net/assets/pas.Icon Warehouse-e29a964d.svg?v=12.1.0.4");
    -webkit-mask-position: -544px 0px;
    -webkit-mask-repeat: no-repeat;
    background-color:  #4b5563;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.15s ease, background-color 0.15s ease;
}
th:hover .icon-filter,
.icon-filter.icon-filter-active {
  opacity: 1;
}
</style>
