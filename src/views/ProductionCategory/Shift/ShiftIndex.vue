<template>
  <div class="main-view">
    <div class="layout-list">
      <div class="title-layout-list">
        <div class="title-text">{{ t('shift.title') }}</div>
        <div class="action-btn-header">
          <MsButton class="btn-export" @click="exportExcel" :disabled="exporting">
            <div class="icon-export-r icon16"></div>
            <div class="btn-text">{{ t('common.exportExcelFile') }}</div>
          </MsButton>
          <MsButton class="btn-add" @click="openModal">
            <div class="icon-plus-white icon16"></div>
            <div class="btn-text">{{ t('common.add') }}</div>
          </MsButton>
        </div>
      </div>
      <div class="body-layout-list">
        <div class="body-list">
          <div class="body-list-header">
            <div class="body-list-header-left">
              <div class="search-box">
                <MsSearchBox @search="onSearch"></MsSearchBox>
              </div>
              <div class="feature-batch" v-if="selectedCount > 0">
                <div class="selected-count">
                  {{ t('common.selected') }} <strong>{{ selectedCount }}</strong>
                </div>
                <div class="unselected" @click="clearSelection">{{ t('common.unselect') }}</div>
                <MsButton class="active-btn" v-if="hasSelectedActive" @click="batchActivate">
                  <div class="icon-active icon16"></div>
                  <div class="btn-text">{{ t('common.use') }}</div>
                </MsButton>
                <MsButton class="inactive-btn" v-if="hasSelectedInactive" @click="batchDeactivate">
                  <div class="icon-empty icon16"></div>
                  <div class="btn-text">{{ t('common.stopUsing') }}</div>
                </MsButton>
                <MsButton class="delete-btn" @click="showBatchDeleteDialog">
                  <div class="icon-delete icon16"></div>
                  <div class="btn-text">{{ t('common.delete') }}</div>
                </MsButton>
              </div>
              <div class="filter-conditions" v-if="activeFilterItems.length && selectedCount === 0">
                <div class="filter-item" v-for="filter in activeFilterItems" :key="filter.key">
                  <div class="filter-label">
                    <span class="filter-field-label">{{ filter.fieldLabel }}</span>
                    <span v-if="filter.showOperator" class="filter-operator-label">
                      {{ filter.operatorLabel }}
                    </span>
                    <span
                      class="filter-value-label"
                      :class="{ 'filter-value-label--status': filter.isStatusFilter }"
                    >
                      {{ filter.valueLabel }}
                    </span>
                  </div>
                  <div
                    class="icon-close-filter icon16"
                    @click="clearColumnFilter(filter.field)"
                  ></div>
                </div>
                <div class="delete-all-filter" @click="clearAllColumnFilters">
                  {{ t('common.clearFilter') }}
                </div>
              </div>
            </div>
            <div class="body-list-header-btn">
              <MsButton
                class="reload-btn"
                v-tooltip.top="t('common.reload')"
                @click="reloadData"
                :disabled="loading"
                :class="{ 'loading-state': loading }"
              >
                <div class="icon-reload icon16"></div>
              </MsButton>
            </div>
          </div>
          <div class="body-list-table">
            <MsTable
              :fields="fields"
              :rows="rows"
              :selected-keys="selectedKeys"
              :loading="loading"
              :page-size="pageSize"
              :filter-reset-key="filterResetKey"
              :filter-reset-version="filterResetVersion"
              @select="onSelectRow"
              @select-all="onSelectAll"
              @clear-selection="clearSelection"
              @edit="openEditPopup"
              @duplicate="openDuplicatePopup"
              @delete="showDeleteDialog"
              @toggle-active="toggleRowActive"
              @filter="applyColumnFilter"
              @clear-filter="clearColumnFilter"
            >
              <template #inActive="{ row, value }">
                <div
                  :class="[
                    'status-badge',
                    value ? 'status-badge--active' : 'status-badge--inactive',
                  ]"
                >
                  <div class="dot-icon">•</div>
                  {{ value ? t('common.active') : t('common.inactive') }}
                </div>
              </template>
            </MsTable>
          </div>
          <MsFooterPaging
            v-model:page-size="pageSize"
            :page="page"
            :total-record="totalRecord"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
  <ShiftPopup
    :isActive="isShowModal"
    :shift-data="editingShift"
    @close="closePopup"
    @saved="handleSaved"
  ></ShiftPopup>
  <MsDialog
    :isActive="deleteDialogActive"
    isConfirm
    :title="t('shift.deleteTitle')"
    :cancelText="t('common.cancel')"
    :confirmText="t('common.delete')"
    @close="cancelDelete"
    @confirm="confirmDelete"
    duplicate-shift-code="false"
  >
    <div v-if="deleteMode === 'single'">
      <i18n-t keypath="shift.messages.deleteSingle" tag="span">
        <template #code
          ><strong>{{ selectedRow?.shiftCode }}</strong></template
        >
      </i18n-t>
    </div>
    <div v-else-if="selectedCount === 1">
      <i18n-t keypath="shift.messages.deleteSingle" tag="span">
        <template #code
          ><strong>{{ selectedRow?.shiftCode }}</strong></template
        >
      </i18n-t>
    </div>
    <div v-else>
      <i18n-t keypath="shift.messages.deleteMany" tag="span">
        <template #count
          ><strong>{{ selectedCount }}</strong></template
        >
      </i18n-t>
    </div>
  </MsDialog>
  <MsDialog
    :isActive="deleteWarningDialogActive"
    :title="t('common.warning')"
    @close="closeDeleteWarningDialog"
  >
    {{ deleteWarningMessage }}
  </MsDialog>
  <MsToast v-if="toastActive" :type="toastType" @close="toastActive = false">{{ toastMessage }}</MsToast>
</template>
<script setup>
import MsButton from '@/components/ms-button/MsButton.vue'
import MsSearchBox from '@/components/ms-search-box/MsSearchBox.vue'
import { label } from '@primeuix/themes/aura/metergroup'
import MsTable from '@/components/ms-table/MsTable.vue'
import MsFooterPaging from '@/components/ms-footer-paging/MsFooterPaging.vue'
import MsDialog from '@/components/ms-dialog/MsDialog.vue'
import MsToast from '@/components/ms-toast/MsToast.vue'

import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ShiftPopup from './ShiftPopup.vue'
import ShiftAPI from '@/apis/components/ShiftAPI.js'
import { useToast } from '@/utils/ToastUtil.js'
import { Shift } from '@/models/Shift.js'

const { t } = useI18n()

const isShowModal = ref(false)
const editingShift = ref(null)

/**
 * nptnhan (5/6/2026) hàm open modal
 */
const openModal = () => {
  editingShift.value = null
  isShowModal.value = true
}

/**
 * nptnhan (5/6/2026) hàm open edit popup
 */
const openEditPopup = (row) => {
  editingShift.value = { ...row }
  isShowModal.value = true
}

/**
 * nptnhan (5/6/2026) hàm open duplicate popup
 */
const openDuplicatePopup = (row) => {
  editingShift.value = {
    ...row,
    shiftId: null,
    ShiftId: null,
    id: null,
    shiftCode: '',
  }
  isShowModal.value = true
}

/**
 * nptnhan (5/6/2026) hàm close popup
 */
const closePopup = () => {
  isShowModal.value = false
  editingShift.value = null
}

/**
 * nptnhan (5/6/2026) hàm handle saved
 */
const handleSaved = async (mode, savedShift = null) => {
  if (mode === 'reload') {
    await loadData()
    return
  }

  if (mode === 'edit-and-add') {
    editingShift.value = null
  }
  await loadData()
  if (mode === 'add' && savedShift) {
    moveSavedShiftToTop(savedShift)
  }
  showToast(
    mode === 'edit' || mode === 'edit-and-add'
      ? t('shift.messages.updateSuccess')
      : t('shift.messages.addSuccess'),
  )
}

/**
 * nptnhan (5/6/2026) hàm fields
 */
const fields = computed(() => [
  {
    key: 'shiftCode',
    label: t('shift.fields.shiftCode'),
    type: 'text',
    typeFilter: {
      type: 'text',
      field: 'shift_code',
      modes: ['contains', 'not_contains', 'starts_with', 'ends_with'],
    },
  },
  {
    key: 'shiftName',
    label: t('shift.fields.shiftName'),
    type: 'text',
    typeFilter: {
      type: 'text',
      field: 'shift_name',
      modes: ['contains', 'not_contains', 'starts_with', 'ends_with'],
    },
  },
  {
    key: 'beginShiftTime',
    label: t('shift.fields.beginShiftTime'),
    type: 'time',
    typeFilter: {
      type: 'time',
      field: 'begin_shift_time',
      modes: ['eq', 'neq', 'gt', 'lt'],
    },
  },
  {
    key: 'endShiftTime',
    label: t('shift.fields.endShiftTime'),
    type: 'time',
    typeFilter: {
      type: 'time',
      field: 'end_shift_time',
      modes: ['eq', 'neq', 'gt', 'lt'],
    },
  },
  {
    key: 'beginBreakTime',
    label: t('shift.fields.beginBreakTime'),
    type: 'time',
    typeFilter: {
      type: 'time',
      field: 'begin_break_time',
      modes: ['eq', 'neq', 'gt', 'lt'],
    },
  },
  {
    key: 'endBreakTime',
    label: t('shift.fields.endBreakTime'),
    type: 'time',
    typeFilter: {
      type: 'time',
      field: 'end_break_time',
      modes: ['eq', 'neq', 'gt', 'lt'],
    },
  },
  {
    key: 'workingTime',
    label: t('shift.fields.workingTime'),
    type: 'number',
    typeFilter: {
      type: 'number',
      field: 'working_time',
      modes: ['eq', 'neq', 'gt', 'lt'],
    },
  },
  {
    key: 'breakingTime',
    label: t('shift.fields.breakingTime'),
    type: 'number',
    typeFilter: {
      type: 'number',
      field: 'breaking_time',
      modes: ['eq', 'neq', 'gt', 'lt'],
    },
  },
  {
    key: 'inActive',
    label: t('shift.fields.inActive'),
    type: 'custom',
    typeFilter: {
      type: 'boolean',
      field: 'in_active',
      operator: 'eq',
    },
  },
  { key: 'createdBy', label: t('shift.fields.createdBy'), type: 'text' },
  { key: 'createdDate', label: t('shift.fields.createdDate'), type: 'date' },
  { key: 'modifiedBy', label: t('shift.fields.modifiedBy'), type: 'text' },
  { key: 'modifiedDate', label: t('shift.fields.modifiedDate'), type: 'date' },
])

const rows = ref([])
const selectedKeys = ref([])
const deleteDialogActive = ref(false)
const deleteMode = ref('single')
const selectedRow = ref(null)
const deleteWarningDialogActive = ref(false)
const deleteWarningMessage = ref('')
const loading = ref(false)
const exporting = ref(false)
const searchQuery = ref('')
const columnFilters = ref({})
const filterResetKey = ref('')
const filterResetVersion = ref(0)
const { toastActive, toastMessage, toastType, showToast } = useToast()

/**
 * nptnhan (6/6/2026) hàm chuẩn hóa dữ liệu ca làm việc từ API
 */
const normalizeShiftRow = (item) => ({
  ...item,
  ...new Shift(item),
})

/**
 * nptnhan (5/6/2026) hàm lấy khóa của ca làm việc
 */
const getShiftKey = (row) => row?.shiftId || row?.ShiftId || row?.id

/**
 * nptnhan (6/6/2026) hàm lấy mã ca làm việc
 */
const getShiftCode = (row) => row?.shiftCode || row?.ShiftCode || row?.shift_code || ''

/**
 * nptnhan (5/6/2026) hàm đưa ca vừa thêm lên đầu danh sách hiện tại
 */
const moveSavedShiftToTop = (savedShift) => {
  const savedKey = getShiftKey(savedShift)
  const savedCode = String(getShiftCode(savedShift)).trim()
  const loadedSavedShift = rows.value.find((row) => {
    const rowKey = getShiftKey(row)
    if (savedKey && rowKey === savedKey) return true

    return savedCode && String(getShiftCode(row)).trim() === savedCode
  })
  const rowToMove = loadedSavedShift || savedShift
  const rowToMoveKey = getShiftKey(rowToMove)
  const rowToMoveCode = String(getShiftCode(rowToMove)).trim()
  const filteredRows = rows.value.filter((row) => {
    const rowKey = getShiftKey(row)
    if (rowToMoveKey && rowKey === rowToMoveKey) return false

    return !rowToMoveCode || String(getShiftCode(row)).trim() !== rowToMoveCode
  })

  rows.value = [rowToMove, ...filteredRows].slice(0, pageSize.value)
}

/**
 * nptnhan (5/6/2026) hàm selected rows
 */
const selectedRows = computed(() => {
  return rows.value.filter((row) => {
    const id = getShiftKey(row)
    return selectedKeys.value.includes(id)
  })
})

/**
 * nptnhan (5/6/2026) hàm selected count
 */
const selectedCount = computed(() => selectedKeys.value.length)

/**
 * nptnhan (5/6/2026) hàm has selected active
 */
const hasSelectedActive = computed(() => selectedRows.value.some((row) => !row.inActive))

/**
 * nptnhan (5/6/2026) hàm has selected inactive
 */
const hasSelectedInactive = computed(() => selectedRows.value.some((row) => row.inActive))

/**
 * nptnhan (5/6/2026) hàm filter operator labels
 */
const filterOperatorLabels = computed(() => ({
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
 * nptnhan (5/6/2026) hàm format filter value
 */
const formatFilterValue = (filter) => {
  if (filter.field?.typeFilter?.type === 'boolean') {
    return filter.value ? t('common.active') : t('common.inactive')
  }

  if (filter.field?.typeFilter?.type === 'time') {
    return String(filter.value || '').slice(0, 5)
  }

  return filter.value
}

/**
 * nptnhan (5/6/2026) hàm active filter items
 */
const activeFilterItems = computed(() => {
  return Object.entries(columnFilters.value).map(([key, filter]) => ({
    key,
    field: filter.field,
    fieldLabel: `${filter.field.label}`,
    operatorLabel: filterOperatorLabels.value[filter.mode] || t('shift.filterOperators.eq'),
    showOperator: filter.field?.typeFilter?.type !== 'boolean',
    isStatusFilter: filter.field?.typeFilter?.type === 'boolean',
    valueLabel: formatFilterValue(filter),
  }))
})

/**
 * nptnhan (5/6/2026) hàm show delete dialog
 */
const showDeleteDialog = (row) => {
  selectedRow.value = row
  deleteMode.value = 'single'
  deleteDialogActive.value = true
}

/**
 * nptnhan (5/6/2026) hàm show batch delete dialog
 */
const showBatchDeleteDialog = () => {
  if (!selectedCount.value) return

  if (selectedCount.value === 1) {
    selectedRow.value = selectedRows.value[0]
    deleteMode.value = 'single'
    deleteDialogActive.value = true
    return
  }

  selectedRow.value = null
  deleteMode.value = 'batch'
  deleteDialogActive.value = true
}

/**
 * nptnhan (5/6/2026) hàm on select row
 */
const onSelectRow = ({ row, selected }) => {
  const id = getShiftKey(row)
  if (!id) return

  if (selected) {
    if (!selectedKeys.value.includes(id)) {
      selectedKeys.value.push(id)
    }
  } else {
    selectedKeys.value = selectedKeys.value.filter((key) => key !== id)
  }
}

/**
 * nptnhan (5/6/2026) hàm on select all
 */
const onSelectAll = async (rowsToSelect) => {
  selectedKeys.value = rowsToSelect
    .map((row) => row.shiftId || row.ShiftId || row.id)
    .filter(Boolean)
}

/**
 * nptnhan (5/6/2026) hàm clear selection
 */
const clearSelection = () => {
  selectedKeys.value = []
}

/**
 * nptnhan (5/6/2026) hàm batch activate
 */
const batchActivate = async () => {
  if (!selectedCount.value) return
  const ids = selectedRows.value.map((row) => row.shiftId || row.ShiftId || row.id)
  if (!ids.length) return

  try {
    const res = await ShiftAPI.updateActive(ids, true)
    if (res?.data?.isSuccess === true) {
      await loadData()
      clearSelection()
    } else {
      showDeleteWarningDialog(res?.data?.userMessage)
      console.error('Batch activate failed', res)
    }
  } catch (err) {
    showDeleteWarningDialog(err?.response?.data?.userMessage)
    console.error('API batch activate error', err)
  }
}

/**
 * nptnhan (5/6/2026) hàm batch deactivate
 */
const batchDeactivate = async () => {
  if (!selectedCount.value) return
  const ids = selectedRows.value.map((row) => row.shiftId || row.ShiftId || row.id)
  if (!ids.length) return

  try {
    const res = await ShiftAPI.updateActive(ids, false)
    if (res?.data?.isSuccess === true) {
      await loadData()
      clearSelection()
    } else {
      showDeleteWarningDialog(res?.data?.userMessage)
      console.error('Batch deactivate failed', res)
    }
  } catch (err) {
    showDeleteWarningDialog(err?.response?.data?.userMessage)
    console.error('API batch deactivate error', err)
  }
}

/**
 * nptnhan (5/6/2026) hàm toggle row active
 */
const toggleRowActive = async (row) => {
  if (!row) return

  const id = row.shiftId || row.ShiftId || row.id
  if (!id) {
    console.error(t('shift.messages.notFoundIdForStatus'))
    return
  }

  try {
    const newInActive = !row.inActive
    const res = await ShiftAPI.updateActive([id], newInActive)

    if (res?.data?.isSuccess === true) {
      await loadData()
    } else {
      showDeleteWarningDialog(res?.data?.userMessage)
      console.error(t('shift.messages.updateStatusFailed'), res)
    }
  } catch (err) {
    showDeleteWarningDialog(err?.response?.data?.userMessage)
    console.error('API updateActive error', err)
  }
}

/**
 * nptnhan (5/6/2026) hàm cancel delete
 */
const cancelDelete = () => {
  selectedRow.value = null
  deleteMode.value = 'single'
  deleteDialogActive.value = false
}

const showDeleteWarningDialog = (message) => {
  const isStaleDelete = String(message || '').includes('không tồn tại hoặc đã bị xóa')
  deleteWarningMessage.value = isStaleDelete || !message ? t('shift.messages.deleteStale') : message
  deleteWarningDialogActive.value = true
}

const closeDeleteWarningDialog = async () => {
  deleteWarningDialogActive.value = false
  deleteWarningMessage.value = ''
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm confirm delete
 */
const confirmDelete = async () => {
  if (deleteMode.value === 'batch') {
    await confirmBatchDelete()
    return
  }

  if (!selectedRow.value) {
    deleteDialogActive.value = false
    return
  }

  try {
    const id = selectedRow.value.shiftId || selectedRow.value.ShiftId || selectedRow.value.id
    if (!id) {
      throw new Error(t('shift.messages.notFoundIdForDelete'))
    }

    const res = await ShiftAPI.delete(id)

    if (res?.data?.isSuccess === true) {
      await loadData()
      showToast(t('shift.messages.deleteSuccess'))
    } else {
      showDeleteWarningDialog(res?.data?.userMessage)
    }
  } catch (err) {
    showDeleteWarningDialog(err?.response?.data?.userMessage)
    console.error('API delete error', err)
  } finally {
    selectedRow.value = null
    deleteMode.value = 'single'
    deleteDialogActive.value = false
  }
}

/**
 * nptnhan (5/6/2026) hàm confirm batch delete
 */
const confirmBatchDelete = async () => {
  const ids = [...selectedKeys.value]
  if (!ids.length) {
    deleteDialogActive.value = false
    return
  }

  try {
    const res = await ShiftAPI.deleteMany(ids)

    if (res?.data?.isSuccess === true) {
      await loadData()
      clearSelection()
      showToast(t('shift.messages.batchDeleteSuccess', { count: ids.length }))
    } else {
      showDeleteWarningDialog(res?.data?.userMessage)
      console.error('Batch delete failed', res)
    }
  } catch (err) {
    showDeleteWarningDialog(err?.response?.data?.userMessage)
    console.error('API batch delete error', err)
  } finally {
    selectedRow.value = null
    deleteMode.value = 'single'
    deleteDialogActive.value = false
  }
}

const page = ref(1)
const pageSize = ref(10)

const totalRecord = ref(0)

/**
 * nptnhan (7/6/2026) hàm format giờ trước khi gửi filter API
 */
const formatTime = (value) => {
  if (!value || typeof value !== 'string') return value
  if (value.length === 5 && value.indexOf(':') === 2) {
    return `${value}:00`
  }
  return value
}

/**
 * nptnhan (5/6/2026) hàm normalize filter value
 */
const normalizeFilterValue = (filter) => {
  if (filter.field?.typeFilter?.type === 'number') {
    const value = Number(filter.value)
    return Number.isNaN(value) ? null : value
  }

  if (filter.field?.typeFilter?.type === 'time') {
    return formatTime(filter.value)
  }

  if (filter.field?.typeFilter?.type === 'boolean') {
    return filter.value
  }

  return typeof filter.value === 'string' ? filter.value.trim() : filter.value
}

/**
 * nptnhan (5/6/2026) hàm build filter payload
 */
const buildFilterPayload = () => {
  const requestFilters = []

  Object.values(columnFilters.value).forEach((filter) => {
    const typeFilter = filter.field?.typeFilter
    const value = normalizeFilterValue(filter)
    if (!typeFilter || value === null || value === undefined || value === '') return

    requestFilters.push({
      field: typeFilter.field,
      operator: filter.mode || typeFilter.operator || 'eq',
      value,
    })
  })

  return requestFilters
}

/**
 * nptnhan (5/6/2026) hàm apply column filter
 */
const applyColumnFilter = async (filter) => {
  const value = normalizeFilterValue(filter)
  if (value === null || value === undefined || value === '') {
    delete columnFilters.value[filter.field.key]
  } else {
    columnFilters.value[filter.field.key] = {
      ...filter,
      value,
    }
  }

  page.value = 1
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm clear column filter
 */
const clearColumnFilter = async (field) => {
  delete columnFilters.value[field.key]
  filterResetKey.value = field.key
  filterResetVersion.value += 1
  page.value = 1
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm clear all column filters
 */
const clearAllColumnFilters = async () => {
  columnFilters.value = {}
  filterResetKey.value = '*'
  filterResetVersion.value += 1
  page.value = 1
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm get file name from header
 */
const getFileNameFromHeader = (contentDisposition) => {
  if (!contentDisposition) return null

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8FileName?.[1]) {
    return decodeURIComponent(utf8FileName[1])
  }

  const fileName = contentDisposition.match(/filename="?([^"]+)"?/i)
  return fileName?.[1] || null
}

/**
 * nptnhan (5/6/2026) hàm download blob
 */
const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * nptnhan (5/6/2026) hàm export excel
 */
const exportExcel = async () => {
  try {
    exporting.value = true
    const request = {
      pageIndex: 1,
      pageSize: totalRecord.value || pageSize.value,
      search: searchQuery.value,
      filters: buildFilterPayload(),
      isExport: true,
    }

    const res = await ShiftAPI.exportExcel(request)
    const fileName =
      getFileNameFromHeader(res.headers?.['content-disposition']) ||
      `Shift_${new Date().toISOString().slice(0, 10)}.xlsx`

    downloadBlob(res.data, fileName)
    showToast(t('shift.messages.exportSuccess'))
  } catch (err) {
    console.error('Export excel error:', err)
    console.error('Error response:', err.response?.data)
    console.error('Error status:', err.response?.status)
    showToast(t('shift.messages.exportError'), 3000, 'error')
  } finally {
    exporting.value = false
  }
}

/**
 * nptnhan (5/6/2026) hàm load data
 */
async function loadData() {
  try {
    loading.value = true
    const startTime = Date.now()
    const request = {
      pageIndex: page.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      filters: buildFilterPayload(),
      isExport: false,
    }
    console.log('Loading request:', request)
    const res = await ShiftAPI.getPaged(request)

    const elapsed = Date.now() - startTime
    const minLoadingTime = 2000
    if (elapsed < minLoadingTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed))
    }

    const data = res.data.data.data
    rows.value = data.map(normalizeShiftRow)

    selectedKeys.value = []
    totalRecord.value = res.data.data.total
  } catch (err) {
    console.error('API error:', err)
    console.error('Error response:', err.response?.data)
    console.error('Error status:', err.response?.status)
    showToast(t('shift.messages.loadError'), 3000, 'error')
  } finally {
    loading.value = false
  }
}

/**
 * nptnhan (8/6/2026) hàm handle page change
 */
const handlePageChange = async (newPage) => {
  page.value = newPage
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm reload data
 */
const reloadData = async () => {
  page.value = 1
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm on search
 */
const onSearch = async (keyword) => {
  searchQuery.value = keyword
  page.value = 1
  await loadData()
}

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(pageSize, async () => {
  page.value = 1
  await loadData()
})

/**
 * nptnhan (5/6/2026) hàm xử lý khi component được khởi tạo
 */
onMounted(async () => {
  await loadData()
})

</script>
<style scoped>
.main-view {
  position: absolute;
  background-color: #e5e7eb;
  top: 48px;
  left: var(--sidebar-width, 248px);
  right: 0;
  bottom: 0;
}
.layout-list {
  display: flex;
  flex-direction: column;
  padding: 16px 20px 20px;
  height: 100%;
}
.title-layout-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.title-text {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: #101828;
  white-space: nowrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
}
.btn-add {
  background-color: #0e9a62;
  color: #fff;
}
.btn-add:hover {
  background-color: #0a724b;
  color: #fff;
}
.btn-text {
  padding-left: 0.25rem;
  white-space: nowrap;
}
.body-layout-list {
  height: calc(100% - 28px);
}
.body-list {
  height: 100%;
  background-color: #fff;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.body-list-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
}
.reload-btn {
  background-color: #fff;
  border: 1px solid #d5d7da;
}
.reload-btn:hover {
  background-color: #f3f4f6;
}
.reload-btn.loading-state {
  cursor: not-allowed;
  opacity: 0.6;
}
.reload-btn.loading-state:hover {
  background-color: #fff;
}
.icon-reload.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.search-box {
  width: 200px;
}
.body-list-table {
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  height: calc(100% - 100px);
}

.body-list-table::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.body-list-table::-webkit-scrollbar-track {
  background: transparent;
}

.body-list-table::-webkit-scrollbar-thumb {
  background: #d5d7da;
  border-radius: 4px;
}

.body-list-table::-webkit-scrollbar-thumb:hover {
  background: #999;
}
:deep(.col__shiftcode) {
  width: 120px;
}
:deep(.col__shiftname) {
  width: 250px;
}
:deep(.col__beginshifttime) {
  width: 130px;
}
:deep(.col__endshifttime) {
  width: 130px;
}
:deep(.col__beginbreaktime) {
  width: 200px;
}
:deep(.col__endbreaktime) {
  width: 210px;
}
:deep(.col__workingtime) {
  width: 210px;
  text-align: right;
}
:deep(.col__workingtime .th-content) {
  display: flex;
  justify-content: flex-end;
}
:deep(.col__breakingtime) {
  width: 230px;
  text-align: right;
}
:deep(.col__breakingtime .th-content) {
  display: flex;
  justify-content: flex-end;
}
:deep(.col__inactive) {
  width: 200px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 13px;
  color: #ffffff;
  height: 26px;
}
.status-badge--active {
  background-color: #ecfdf3;
  color: #12b76a;
  border: solid 1px #a6f4c5;
}
.status-badge--inactive {
  background-color: #fef3f2;
  color: #f04438;
  border: solid 1px #fecdca;
}
.dot-icon {
  font-size: 26px;
  padding-right: 5px;
  padding-bottom: 4px;
}
:deep(.col__createdby) {
  width: 160px;
}
:deep(.col__createddate) {
  width: 160px;
}
:deep(.col__modifiedby) {
  width: 160px;
}
:deep(.col__modifieddate) {
  width: 160px;
}
.feature-batch {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  height: 28px;
  font-size: 13px;
}
.filter-conditions {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
}
.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  background-color: #f3f4f6;
  color: #101828;
  font-size: 13px;
}
.filter-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.filter-field-label {
  font-weight: 400;
  color: #101828;
}
.filter-operator-label {
  color: #009b71;
}
.filter-value-label {
  font-weight: 400;
  color: #101828;
}
.filter-value-label--status {
  color: #009b71;
}
.filter-item .icon-close {
  background-color: #4b5563;
}
.filter-item .icon-close:hover {
  background-color: #f04438;
}
.delete-all-filter {
  color: #f04438;
  cursor: pointer;
  font-size: 13px;
}
.delete-all-filter:hover {
  text-decoration: underline;
}

.unselected {
  color: #0e9a62;
  cursor: pointer;
  margin: 0px 8px;
}
.unselected:hover {
  text-decoration: underline;
  color: #0a724b;
}
.active-btn {
  color: #0e9a62;
  border: 1px solid #0e9a62;
  background-color: #fff;
}
.active-btn:hover {
  background-color: #cdeadf;
}
.icon-active {
  background-color: #0e9a62;
}
.inactive-btn {
  color: #f04438;
  border: 1px solid #f04438;
  background-color: #fff;
}
.inactive-btn:hover {
  background-color: #fef3f2;
}
.delete-btn {
  color: #f04438;
  border: 1px solid #f04438;
  background-color: #fff;
}
.delete-btn:hover {
  background-color: #fef3f2;
}
.icon-empty {
  background-color: #f04438;
}
.body-list-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-btn-header {
  display: flex;
  gap: 8px;
}
.btn-export {
  border: 1px solid #d5d7da;
  color: #000;
  background-color: #fff;
}
.btn-export:hover {
  background-color: #f3f4f6;
}

</style>
