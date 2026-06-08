<template>
  <div class="change-log-view">
    <div class="change-log-header">
      <div class="change-log-title-wrap">
        <div class="icon-back-arrow icon20" @click="goBack"></div>
        <div class="change-log-title">{{ t('setup.accessLog') }}</div>
      </div>
    </div>

    <div class="change-log-content">
      <div class="content-container">
        <div class="change-log-table">
          <MsTable
            :fields="fields"
            :rows="displayRows"
            :selected-keys="selectedKeys"
            row-key="logId"
            :loading="loading"
            :page-size="pageSize"
          >
            <template #rowIndex="{ row }">
              <span>{{ row.rowIndex }}</span>
            </template>
            <template #actionType="{ value }">
              <span>{{ getActionLabel(value) }}</span>
            </template>
            <template #content="{ row }">
              <span>{{ getLogContent(row) }}</span>
            </template>
            <template #changedDate="{ value }">
              <span>{{ formatDateTime(value) }}</span>
            </template>
          </MsTable>

          <div v-if="!loading && loadError" class="table-state">{{ loadError }}</div>
          <div v-else-if="!loading && !displayRows.length" class="table-state">
            Chưa có nhật ký truy cập
          </div>
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
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MsTable from '@/components/ms-table/MsTable.vue'
import MsFooterPaging from '@/components/ms-footer-paging/MsFooterPaging.vue'
import ChangeLogAPI from '@/apis/components/ChangeLogAPI.js'

const router = useRouter()
const { t } = useI18n()
const rows = ref([])
const selectedKeys = ref([])
const loading = ref(false)
const loadError = ref('')
const page = ref(1)
const pageSize = ref(10)
const totalRecord = ref(0)

const fields = computed(() => [
  { key: 'rowIndex', label: 'STT', type: 'custom' },
  { key: 'actionType', label: 'Hành động', type: 'custom' },
  { key: 'tableName', label: 'Bảng', type: 'text' },
  { key: 'content', label: 'Nội dung', type: 'custom' },
  { key: 'changedBy', label: 'Người thay đổi', type: 'text' },
  { key: 'changedDate', label: 'Thời gian', type: 'custom' },
])

const fieldNameMap = {
  shift_code: 'Mã ca',
  shift_name: 'Tên ca',
  begin_shift_time: 'Giờ vào ca',
  end_shift_time: 'Giờ hết ca',
  begin_break_time: 'Bắt đầu nghỉ giữa ca',
  end_break_time: 'Kết thúc nghỉ giữa ca',
  working_time: 'Thời gian làm việc',
  breaking_time: 'Thời gian nghỉ giữa ca',
  in_active: 'Trạng thái',
  shift_description: 'Mô tả',
}

const displayRows = computed(() => {
  return rows.value.map((row, index) => ({
    ...row,
    rowIndex: (page.value - 1) * pageSize.value + index + 1,
  }))
})

const normalizeChangeLog = (item = {}) => ({
  logId: item.logId || item.LogId || item.log_id || '',
  tableName: item.tableName || item.TableName || item.table_name || '',
  recordId: item.recordId || item.RecordId || item.record_id || '',
  actionType: item.actionType || item.ActionType || item.action_type || '',
  fieldName: item.fieldName || item.FieldName || item.field_name || '',
  oldValue: item.oldValue ?? item.OldValue ?? item.old_value ?? '',
  newValue: item.newValue ?? item.NewValue ?? item.new_value ?? '',
  changedBy: item.changedBy || item.ChangedBy || item.changed_by || '',
  changedDate: item.changedDate || item.ChangedDate || item.changed_date || '',
})

const goBack = () => {
  router.push('/system/setup')
}

const getActionLabel = (actionType) => {
  const actionMap = {
    INSERT: 'Thêm',
    UPDATE: 'Sửa',
    DELETE: 'Xóa',
  }

  return actionMap[actionType] || actionType || ''
}

const parseJsonValue = (value) => {
  if (!value || typeof value !== 'string') return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const formatLogValue = (fieldName, value) => {
  if (value === null || value === undefined || value === '') return '-'

  if (fieldName === 'in_active') {
    return Number(value) === 1 || value === true || value === 'true' ? 'Đang sử dụng' : 'Ngừng sử dụng'
  }

  return String(value)
}

const getShiftLabel = (item) => {
  if (!item || typeof item !== 'object') return ''
  return item.shift_code || item.shiftCode || item.shift_name || item.shiftName || item.shift_id || item.shiftId || ''
}

const getArrayUpdateContent = (oldData, newData) => {
  if (!Array.isArray(oldData) || !Array.isArray(newData)) return ''

  return newData
    .map((newItem, index) => {
      const oldItem =
        oldData.find((item) => item.shift_id && item.shift_id === newItem.shift_id) || oldData[index] || {}
      const shiftLabel = getShiftLabel(newItem) || getShiftLabel(oldItem)
      const oldText = formatLogValue('in_active', oldItem.in_active)
      const newText = formatLogValue('in_active', newItem.in_active)
      return `Trạng thái ${shiftLabel}: ${oldText} -> ${newText}`
    })
    .join('; ')
}

const getArrayDeleteContent = (oldData) => {
  if (!Array.isArray(oldData)) return ''

  const shiftLabels = oldData.map(getShiftLabel).filter(Boolean)
  return shiftLabels.length ? `Xóa ca ${shiftLabels.join(', ')}` : ''
}

const getChangedFieldsContent = (oldValue, newValue) => {
  const oldData = parseJsonValue(oldValue)
  const newData = parseJsonValue(newValue)
  if (!oldData || !newData) return ''

  const arrayUpdateContent = getArrayUpdateContent(oldData, newData)
  if (arrayUpdateContent) return arrayUpdateContent

  return Object.keys(newData)
    .map((fieldName) => {
      const label = fieldNameMap[fieldName] || fieldName
      const oldText = formatLogValue(fieldName, oldData[fieldName])
      const newText = formatLogValue(fieldName, newData[fieldName])
      return `${label}: ${oldText} -> ${newText}`
    })
    .join('; ')
}

const getLogContent = (row) => {
  if (row.actionType === 'INSERT') {
    return `Thêm mã ca ${row.newValue || ''}`.trim()
  }

  if (row.actionType === 'DELETE') {
    const arrayDeleteContent = getArrayDeleteContent(parseJsonValue(row.oldValue))
    if (arrayDeleteContent) return arrayDeleteContent

    return `Xóa mã ca ${row.oldValue || ''}`.trim()
  }

  if (row.actionType === 'UPDATE') {
    const changedFieldsContent = getChangedFieldsContent(row.oldValue, row.newValue)
    if (changedFieldsContent) return `Sửa ${changedFieldsContent}`

    const fieldLabel = fieldNameMap[row.fieldName] || row.fieldName || 'dữ liệu'
    return `Sửa ${fieldLabel}: ${formatLogValue(row.fieldName, row.oldValue)} -> ${formatLogValue(row.fieldName, row.newValue)}`
  }

  return ''
}

const formatDateTime = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

const loadChangeLogs = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const request = {
      pageIndex: page.value,
      pageSize: pageSize.value,
      search: '',
      filters: [],
      isExport: false,
    }

    const response = await ChangeLogAPI.getPaged(request)
    rows.value = (response?.data?.data?.data || []).map(normalizeChangeLog)
    totalRecord.value = response?.data?.data?.total || 0
    selectedKeys.value = []
  } catch (error) {
    loadError.value = 'Không tải được nhật ký truy cập'
    console.error('Load change logs error', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = async (newPage) => {
  page.value = newPage
  await loadChangeLogs()
}

watch(pageSize, async () => {
  page.value = 1
  await loadChangeLogs()
})

onMounted(() => {
  loadChangeLogs()
})
</script>

<style scoped>
.change-log-view {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  color: #101828;
  overflow: hidden;
}

.change-log-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.change-log-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.change-log-title {
  font-size: 20px;
  font-weight: 600;
  color: #101828;
}

.change-log-content {
  background-color: #e5e7eb;
  padding: 12px;
  flex: 1;
  display: flex;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.content-container {
  background-color: #fff;
  border-radius: 12px;
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.change-log-table {
  position: relative;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  border-top: 1px solid #d9dee7;
}

.change-log-table::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.change-log-table::-webkit-scrollbar-track {
  background: transparent;
}

.change-log-table::-webkit-scrollbar-thumb {
  background: #d5d7da;
  border-radius: 4px;
}

.change-log-table::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.table-state {
  position: absolute;
  left: 0;
  right: 0;
  top: 45px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667085;
  font-size: 14px;
  background-color: #fff;
}

::v-deep(.change-log-table .col__check__box),
::v-deep(.change-log-table .col__actions) {
  display: none;
}

::v-deep(.change-log-table .ms__table) {
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: visible;
}

::v-deep(.change-log-table table) {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
}

::v-deep(.change-log-table thead tr) {
  background-color: #f3f4f6;
}

::v-deep(.change-log-table th) {
  height: 30px;
  color: #101828;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #d9dee7;
  white-space: nowrap;
}

::v-deep(.change-log-table td) {
  height: 32px;
  color: #101828;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 16px;
}

::v-deep(.change-log-table .cell-label),
::v-deep(.change-log-table td span) {
  font-size: 13px;
}

::v-deep(.change-log-table .th-content) {
  padding: 0 16px;
}

::v-deep(.change-log-table .ms-resize) {
  height: 24px;
}

::v-deep(.change-log-table .col__rowindex) {
  width: 56px;
  min-width: 56px;
  max-width: 56px;
  text-align: center;
  padding: 0;
}

::v-deep(.change-log-table th.col__rowindex .th-content) {
  padding: 0;
  justify-content: center;
  text-align: center;
}

::v-deep(.change-log-table th.col__rowindex .menu-wrapper) {
  justify-content: center;
  text-align: center;
}

::v-deep(.change-log-table th.col__rowindex .header-label) {
  width: 100%;
  text-align: center;
}

::v-deep(.change-log-table td.col__rowindex) {
  text-align: center;
}

::v-deep(.change-log-table .col__actiontype) {
  width: 120px;
  min-width: 120px;
}

::v-deep(.change-log-table .col__tablename) {
  width: 140px;
  min-width: 140px;
}

::v-deep(.change-log-table .col__content) {
  width: 520px;
  min-width: 520px;
}

::v-deep(.change-log-table .col__changedby) {
  width: 160px;
  min-width: 160px;
}

::v-deep(.change-log-table .col__changeddate) {
  width: 180px;
  min-width: 180px;
}
</style>
