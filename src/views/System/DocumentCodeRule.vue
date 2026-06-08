<template>
  <div class="document-rule-view">
    <div class="document-rule-header">
      <div class="document-rule-title-wrap">
        <div class="icon-back-arrow icon20" @click="goBack"></div>
        <div class="document-rule-title">{{ t('setup.numberingRule') }}</div>
      </div>
     
    </div>
    <div class="document-rule-content">
        <div class=content-container>
            <div class="document-rule-toolbar">
                <div class="ms-search-box">
                    <MsSearchBox @search="onSearch"></MsSearchBox>
                </div>
                <div class="action-btn">
                    <template v-if="isEditMode">
                        <MsButton class="cancel-rule-btn" @click="cancelEdit" :disabled="loading || saving">
                            <div class="btn-text">Hủy</div>
                        </MsButton>
                        <MsButton class="save-rule-btn" @click="saveRules" :disabled="loading || saving || !editingRuleKey">
                            <div class="btn-text">Lưu</div>
                        </MsButton>
                    </template>
                    <MsButton v-else class="edit-rule-btn" @click="editRules" :disabled="loading">
                        <div class="btn-text">Sửa</div>
                    </MsButton>
                </div>
            </div>

            <div class="document-rule-table">
            <MsTable
                :fields="fields"
                :rows="filteredRows"
                :selected-keys="selectedKeys"
                row-key="ruleId"
                :loading="loading"
                :page-size="10"
                @select="onSelectRow"
                @select-all="onSelectAll"
                @clear-selection="clearSelection"
                @row-click="onRowClick"
            >
                <template #rowIndex="{ row }">
                <span>{{ row.rowIndex }}</span>
                </template>
                <template #prefix="{ row, value }">
                <MsInput
                    v-if="isEditingRow(row)"
                    class="inline-rule-input"
                    v-model="row.prefix"
                    :maxlength="20"
                    @click.stop
                ></MsInput>
                <span v-else>{{ value }}</span>
                </template>
                <template #currentNumber="{ row, value }">
                <MsInput
                    v-if="isEditingRow(row)"
                    class="inline-rule-input inline-rule-input--number"
                    :model-value="String(row.currentNumber ?? '')"
                    @update:modelValue="(value) => updateNumberField(row, 'currentNumber', value)"
                    @click.stop
                ></MsInput>
                <span v-else>{{ value }}</span>
                </template>
                <template #numberLength="{ row, value }">
                <MsInput
                    v-if="isEditingRow(row)"
                    class="inline-rule-input inline-rule-input--number"
                    :model-value="String(row.numberLength ?? '')"
                    @update:modelValue="(value) => updateNumberField(row, 'numberLength', value)"
                    @click.stop
                ></MsInput>
                <span v-else>{{ value }}</span>
                </template>
                <template #suffix="{ row, value }">
                <MsInput
                    v-if="isEditingRow(row)"
                    class="inline-rule-input"
                    v-model="row.suffix"
                    :maxlength="20"
                    @click.stop
                ></MsInput>
                <span v-else>{{ value }}</span>
                </template>
                <template #displayCode="{ value }">
                <span>{{ value }}</span>
                </template>
            </MsTable>
            <div v-if="!loading && loadError" class="table-state">{{ loadError }}</div>
                <div v-else-if="!loading && !filteredRows.length" class="table-state">
                    Chưa có quy tắc đánh số chứng từ
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
    <MsDialog
        :isActive="validateDialogActive"
        :title="t('common.warning')"
        @close="closeValidateDialog"
    >
        {{ validateDialogMessage }}
    </MsDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MsButton from '@/components/ms-button/MsButton.vue'
import MsInput from '@/components/ms-input/MsInput.vue'
import MsSearchBox from '@/components/ms-search-box/MsSearchBox.vue'
import MsTable from '@/components/ms-table/MsTable.vue'
import MsFooterPaging from '@/components/ms-footer-paging/MsFooterPaging.vue'
import MsDialog from '@/components/ms-dialog/MsDialog.vue'
import DocumentCodeRuleAPI from '@/apis/components/DocumentCodeRuleAPI.js'

const router = useRouter()
const { t } = useI18n()
const rows = ref([])
const selectedKeys = ref([])
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const searchText = ref('')
const page = ref(1)
const pageSize = ref(10)
const totalRecord = ref(0)
const isEditMode = ref(false)
const editingRuleKey = ref('')
const validateDialogActive = ref(false)
const validateDialogMessage = ref('')

const fields = computed(() => [
  {
    key: 'rowIndex',
    label: 'STT',
    type: 'custom',
  },
  {
    key: 'documentTypeVi',
    label: 'Loại chứng từ/danh mục',
    type: 'text',
  },
  {
    key: 'prefix',
    label: 'Tiền tố',
    type: 'custom',
  },
  {
    key: 'currentNumber',
    label: 'Giá trị phần số',
    type: 'custom',
  },
  {
    key: 'numberLength',
    label: 'Tổng số ký tự phần số',
    type: 'custom',
  },
  {
    key: 'suffix',
    label: 'Hậu tố',
    type: 'custom',
  },
  {
    key: 'displayCode',
    label: 'Hiển thị',
    type: 'custom',
  },
])

const filteredRows = computed(() => {
  return rows.value.map((row, index) => {
    row.rowIndex = (page.value - 1) * pageSize.value + index + 1
    return row
  })
})

const normalizeDocumentCodeRule = (item = {}) => ({
  ruleId: item.ruleId || item.RuleId || item.rule_id || '',
  tableName: item.tableName || item.TableName || item.table_name || '',
  documentTypeVi: item.documentTypeVi || item.DocumentTypeVi || item.document_type_vi || '',
  prefix: item.prefix || item.Prefix || '',
  currentNumber: item.currentNumber ?? item.CurrentNumber ?? item.current_number ?? 0,
  numberLength: item.numberLength ?? item.NumberLength ?? item.number_length ?? 0,
  suffix: item.suffix || item.Suffix || '',
  displayCode: item.displayCode || item.DisplayCode || item.display_code || '',
})

const goBack = () => {
  router.push('/system/setup')
}

const loadDocumentCodeRules = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const startTime = Date.now()
    const request = {
      pageIndex: page.value,
      pageSize: pageSize.value,
      search: searchText.value,
      filters: [],
      isExport: false,
    }
    const response = await DocumentCodeRuleAPI.getPaged(request)

    const elapsed = Date.now() - startTime
    const minLoadingTime = 2000
    if (elapsed < minLoadingTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed))
    }

    const data = response?.data?.data?.data || []
    rows.value = data.map(normalizeDocumentCodeRule)
    totalRecord.value = response?.data?.data?.total || 0
    selectedKeys.value = []
  } catch (error) {
    loadError.value = 'Không tải được quy tắc đánh số chứng từ'
    console.error('Load document code rules error', error)
  } finally {
    loading.value = false
  }
}

const onSearch = async (keyword) => {
  searchText.value = keyword
  page.value = 1
  await loadDocumentCodeRules()
}

const editRules = () => {
  isEditMode.value = true
  editingRuleKey.value = ''
}

const cancelEdit = async () => {
  isEditMode.value = false
  editingRuleKey.value = ''
  await loadDocumentCodeRules()
}

const saveRules = async () => {
  const editingRule = rows.value.find((row) => getRuleKey(row) === editingRuleKey.value)
  if (!editingRule) return

  const validationMessage = validateRuleCodeLength(editingRule)
  if (validationMessage) {
    validateDialogMessage.value = validationMessage
    validateDialogActive.value = true
    return
  }

  saving.value = true
  loadError.value = ''

  try {
    const payload = {
      ...editingRule,
      currentNumber: Number(editingRule.currentNumber) || 0,
      numberLength: Number(editingRule.numberLength) || 0,
      suffix: editingRule.suffix || null,
      modifiedBy: 'admin',
    }

    const response = await DocumentCodeRuleAPI.update(payload)
    if (response?.data?.isSuccess === true) {
      isEditMode.value = false
      editingRuleKey.value = ''
      await loadDocumentCodeRules()
      return
    }

    loadError.value = response?.data?.userMessage || 'Không lưu được quy tắc đánh số chứng từ'
  } catch (error) {
    loadError.value = error?.response?.data?.userMessage || 'Không lưu được quy tắc đánh số chứng từ'
    console.error('Save document code rule error', error)
  } finally {
    saving.value = false
  }
}

const buildPreviewCode = (rule) => {
  const prefix = String(rule.prefix || '')
  const suffix = String(rule.suffix || '')
  const currentNumber = String(Number(rule.currentNumber) || 0)
  const numberLength = Number(rule.numberLength) || 0
  return `${prefix}${currentNumber.padStart(numberLength, '0')}${suffix}`
}

const validateRuleCodeLength = (rule) => {
  const previewCode = buildPreviewCode(rule)
  if (previewCode.length <= 20) return ''

  return `Mã hiển thị "${previewCode}" đang có ${previewCode.length} ký tự, vượt quá tối đa 20 ký tự. Vui lòng giảm tiền tố, hậu tố hoặc tổng số ký tự phần số.`
}

const closeValidateDialog = () => {
  validateDialogActive.value = false
}

const handlePageChange = async (newPage) => {
  page.value = newPage
  await loadDocumentCodeRules()
}

watch(pageSize, async () => {
  page.value = 1
  await loadDocumentCodeRules()
})

const getRuleKey = (row) => row?.ruleId || row?.tableName

const isEditingRow = (row) => {
  return isEditMode.value && editingRuleKey.value && getRuleKey(row) === editingRuleKey.value
}

const onRowClick = (row) => {
  if (!isEditMode.value) return
  editingRuleKey.value = getRuleKey(row)
}

const updateNumberField = (row, field, value) => {
  const normalizedValue = String(value ?? '').replace(/[^\d]/g, '')
  row[field] = normalizedValue === '' ? 0 : Number(normalizedValue)
}

const onSelectRow = (row, checked) => {
  const key = row?.ruleId
  if (!key) return

  selectedKeys.value = checked
    ? [...new Set([...selectedKeys.value, key])]
    : selectedKeys.value.filter((selectedKey) => selectedKey !== key)
}

const onSelectAll = (checked) => {
  selectedKeys.value = checked ? filteredRows.value.map((row) => row.ruleId).filter(Boolean) : []
}

const clearSelection = () => {
  selectedKeys.value = []
}

onMounted(() => {
  loadDocumentCodeRules()
})
</script>

<style scoped>
.document-rule-view {
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

.document-rule-header {
  height: 88px;
  padding: 28px 14px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.document-rule-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  color: #101828;
}

.document-rule-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-rule-btn {
    border: 1px solid #e5e7eb;
    color: #0e9a62;
    background-color: #fff;
}

.edit-rule-btn:hover {
      background-color: #cdeadf;
}

.cancel-rule-btn {
    border: 1px solid #d1d5db;
    color: #374151;
    background-color: #fff;
}

.cancel-rule-btn:hover {
    background-color: #f3f4f6;
}

.save-rule-btn {
    border: 1px solid #0e9a62;
    color: #fff;
    background-color: #0e9a62;
}

.save-rule-btn:hover {
    background-color: #087f50;
}
.document-rule-content{
    background-color: #e5e7eb;
    padding: 12px;
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
}
.content-container{
    background-color: #fff;
    border-radius: 12px;
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.document-rule-toolbar {
  height: 52px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.document-rule-table {
  position: relative;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  border-top: 1px solid #d9dee7;
}

.document-rule-table::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.document-rule-table::-webkit-scrollbar-track {
  background: transparent;
}

.document-rule-table::-webkit-scrollbar-thumb {
  background: #d5d7da;
  border-radius: 4px;
}

.document-rule-table::-webkit-scrollbar-thumb:hover {
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

::v-deep(.document-rule-toolbar .ms-search-box) {
  width: 250px;
  height: 28px;
}

::v-deep(.document-rule-table .col__check__box),
::v-deep(.document-rule-table .col__actions) {
  display: none;
}

::v-deep(.document-rule-table .ms__table) {
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: visible;
}

::v-deep(.document-rule-table table) {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
}

::v-deep(.document-rule-table thead tr) {
  background-color: #f3f4f6;
}

::v-deep(.document-rule-table th) {
  height: 30px;
  color: #101828;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid #d9dee7;
  white-space: nowrap;
}

::v-deep(.document-rule-table td) {
  height: 32px;
  color: #101828;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
}

::v-deep(.document-rule-table .cell-label),
::v-deep(.document-rule-table td span) {
  font-size: 13px;
}

::v-deep(.document-rule-table .inline-rule-input .input-label) {
  display: none;
}

::v-deep(.document-rule-table .inline-rule-input.ms__input__wrapper) {
  min-height: 26px;
  gap: 0;
}

::v-deep(.document-rule-table .inline-rule-input input) {
  height: 24px;
  padding: 2px 8px;
  font-size: 13px;
}

::v-deep(.document-rule-table .inline-rule-input--number input) {
  text-align: right;
}

::v-deep(.document-rule-table .th-content) {
  padding: 0 16px;
}

::v-deep(.document-rule-table td) {
  padding: 0 16px;
}

::v-deep(.document-rule-table .ms-resize) {
  height: 24px;
}

::v-deep(.document-rule-table .col__rowindex) {
  width: 40px;
  min-width: 40px;
  max-width: 40px;
  text-align: center;
  padding: 0;
}

::v-deep(.document-rule-table th.col__rowindex .th-content) {
  padding: 0;
  justify-content: center;
  text-align: center;
}

::v-deep(.document-rule-table th.col__rowindex .menu-wrapper) {
  justify-content: center;
  text-align: center;
}

::v-deep(.document-rule-table th.col__rowindex .header-label) {
  width: 100%;
  text-align: center;
}

::v-deep(.document-rule-table td.col__rowindex) {
  text-align: center;
}

::v-deep(.document-rule-table th.col__currentnumber .th-content),
::v-deep(.document-rule-table th.col__numberlength .th-content) {
  justify-content: flex-end;
  text-align: right;
}

::v-deep(.document-rule-table .col__documenttypevi) {
  width: 280px;
  min-width: 230px;
  max-width: 280px;
}

::v-deep(.document-rule-table .col__prefix) {
  width: 220px;
  min-width: 180px;
  max-width: 220px;
}

::v-deep(.document-rule-table .col__currentnumber) {
  width: 220px;
  min-width: 180px;
  max-width: 220px;
  text-align: right;
}

::v-deep(.document-rule-table .col__numberlength) {
  width: 220px;
  min-width: 180px;
  max-width: 220px;
  text-align: right;
}

::v-deep(.document-rule-table .col__suffix) {
  width: 220px;
  min-width: 180px;
  max-width: 220px;
}

::v-deep(.document-rule-table .col__displaycode) {
  min-width: 260px;
}
.action-btn{
    display: flex;
    gap: 8px;
}
</style>
