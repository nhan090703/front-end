<template>
  <div>
    <div class="modal-container" v-if="isActive">
      <div class="modal-overlay"></div>
      <div
        ref="modalContentRef"
        class="modal-content"
        :class="{ 'is-dragging': isDragging }"
        :style="modalContentStyle"
        @keydown.tab="handleTabKey"
      >
        <div class="modal-title" @mousedown="startDrag">
          <div class="modal-title-text">{{ popupTitle }}</div>
          <div class="modal-title-btn" @mousedown.stop>
            <div class="icon-help icon20" v-tooltip.top="t('common.help')"></div>
            <div class="icon-close icon20" @click="closePopup"></div>
          </div>
        </div>
        <div class="modal-form">
          <div class="form-row">
            <MsInput
              data-field="shiftCode"
              v-model="shift.shiftCode"
              :error="errors.shiftCode"
              :label="t('shift.fields.shiftCode')"
              :required="true"
              :maxlength="20"
            ></MsInput>
          </div>
          <div class="form-row">
            <MsInput
              data-field="shiftName"
              v-model="shift.shiftName"
              :error="errors.shiftName"
              :label="t('shift.fields.shiftName')"
              :required="true"
              :maxlength="50"
            ></MsInput>
          </div>
          <div class="form-row col-2">
            <MsDatePicker
              data-field="beginShiftTime"
              v-model="shift.beginShiftTime"
              :error="errors.beginShiftTime"
              :label="t('shift.fields.beginShiftTime')"
              :required="true"
            ></MsDatePicker>
            <MsDatePicker
              data-field="endShiftTime"
              v-model="shift.endShiftTime"
              :error="errors.endShiftTime"
              :label="t('shift.fields.endShiftTime')"
              :required="true"
              :width175="true"
            ></MsDatePicker>
          </div>
          <div class="form-row col-2">
            <MsDatePicker
              data-field="beginBreakTime"
              v-model="shift.beginBreakTime"
              :error="errors.beginBreakTime"
              :label="t('shift.fields.beginBreakTime')"
            ></MsDatePicker>
            <MsDatePicker
              data-field="endBreakTime"
              v-model="shift.endBreakTime"
              :error="errors.endBreakTime"
              :label="t('shift.fields.endBreakTime')"
              :width175="true"
            ></MsDatePicker>
          </div>
          <div class="form-row col-2">
            <MsInputNumber
              data-field="workingTime"
              v-model="shift.workingTime"
              :error="errors.workingTime"
              :label="t('shift.fields.workingTime')"
              :warning="isWorkingTimeLessThanBreakingTime"
            ></MsInputNumber>
            <MsInputNumber
              data-field="breakingTime"
              v-model="shift.breakingTime"
              :error="errors.breakingTime"
              :label="t('shift.fields.breakingTime')"
              :width175="true"
            ></MsInputNumber>
          </div>
          <div class="form-row">
            <MsTextArea
              data-field="shiftDescription"
              v-model="shift.shiftDescription"
              :error="errors.shiftDescription"
              :label="t('shift.fields.shiftDescription')"
            ></MsTextArea>
          </div>
          <div class="form-row form-row-status" v-if="isEditMode">
            <MsRadioButton v-model="shift.inActive" :label="t('shift.fields.inActive')"></MsRadioButton>
          </div>
        </div>
        <MsFooter @cancel="closePopup" @save-and-add="saveAndAdd" @save="save" />
      </div>
    </div>
    <MsDialog :isActive="dialogActive" :title="t('common.warning')" @close="closeErrorDialog" :duplicate-shift-code="duplicateShiftCode">
      <template v-if="duplicateShiftCode">
        <i18n-t keypath="shift.messages.duplicateDialog" tag="span">
          <template #code><b class="duplicate-shift-code">{{ duplicateShiftCode }}</b></template>
        </i18n-t>
      </template>
      <template v-else>
        {{ dialogMessage }}
      </template>
    </MsDialog>
    <MsDialog
      :isActive="exitConfirmActive"
      isConfirm
      dialogType="info"
      :title="t('shift.messages.exitTitle')"
      :cancelText="t('common.cancel')"
      :confirmText="t('common.agree')"
      @close="exitConfirmActive = false"
      @confirm="confirmExitWithoutSave"
    >
      {{ t('shift.messages.exitConfirm') }}
    </MsDialog>
  </div>
</template>
<script setup>
import { computed, reactive, watch, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import MsFooter from '@/components/ms-footer/MsFooter.vue'
import MsInput from '@/components/ms-input/MsInput.vue'
import MsDatePicker from '@/components/ms-date-picker/MsDatePicker.vue'
import MsInputNumber from '@/components/ms-input-number/MsInputNumber.vue'
import MsTextArea from '@/components/ms-text-area/MsTextArea.vue'
import MsDialog from '@/components/ms-dialog/MsDialog.vue'
import ShiftAPI from '@/apis/components/ShiftAPI.js'
import { Shift } from '@/models/Shift.js'
import MsRadioButton from '@/components/ms-radio-button/MsRadioButton.vue'
import { computeWorkingTimeHours, computeBreakingTimeHours } from '@/utils/ShiftUtil.js'

const { t } = useI18n()

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
  shiftData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const shift = reactive(new Shift())
const errors = reactive({
  shiftCode: '',
  shiftName: '',
  beginShiftTime: '',
  endShiftTime: '',
  beginBreakTime: '',
  endBreakTime: '',
  workingTime: '',
  breakingTime: '',
  shiftDescription: '',
})
const dialogActive = ref(false)
const dialogMessage = ref('')
const duplicateShiftCode = ref('')
const exitConfirmActive = ref(false)
const initialShiftSnapshot = ref('')
const firstErrorField = ref('')
const modalContentRef = ref(null)
const isDragging = ref(false)
const dragPosition = reactive({
  left: null,
  top: null,
})
const dragOffset = reactive({
  x: 0,
  y: 0,
})

/**
 * nptnhan (5/6/2026) hàm lấy id ca làm việc
 */
const getShiftId = (data) => data?.shiftId || data?.ShiftId || data?.shift_id || data?.id || null

/**
 * nptnhan (5/6/2026) hàm tính is edit mode
 */
const isEditMode = computed(() => Boolean(getShiftId(props.shiftData)))
/**
 * nptnhan (5/6/2026) hàm tính popup title
 */
const popupTitle = computed(() => (isEditMode.value ? t('shift.editTitle') : t('shift.addTitle')))
/**
 * nptnhan (5/6/2026) hàm parse number value
 */
const parseNumberValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(String(value).replace(',', '.'))
  return Number.isNaN(numberValue) ? null : numberValue
}
/**
 * nptnhan (5/6/2026) hàm tính is working time less than breaking time
 */
const isWorkingTimeLessThanBreakingTime = computed(() => {
  const workingTime = parseNumberValue(shift.workingTime)
  const breakingTime = parseNumberValue(shift.breakingTime)

  return workingTime !== null && breakingTime !== null && workingTime < breakingTime
})
/**
 * nptnhan (5/6/2026) hàm tính modal content style
 */
const modalContentStyle = computed(() => {
  if (dragPosition.left === null || dragPosition.top === null) return {}

  return {
    left: `${dragPosition.left}px`,
    top: `${dragPosition.top}px`,
    transform: 'none',
  }
})

/**
 * nptnhan (5/6/2026) hàm clear errors
 */
const clearErrors = () => {
  Object.keys(errors).forEach((key) => (errors[key] = ''))
  duplicateShiftCode.value = ''
  dialogMessage.value = ''
  dialogActive.value = false
  firstErrorField.value = ''
}

/**
 * nptnhan (5/6/2026) hàm get shift snapshot
 */
const normalizeTimeForCompare = (value) => {
  if (!value) return ''
  return String(value).slice(0, 5)
}

/**
 * nptnhan (6/6/2026) hàm chuẩn hóa số để so sánh thay đổi
 */
const normalizeNumberForCompare = (value) => {
  if (value === null || value === undefined || value === '') return ''

  const numberValue = Number(String(value).replace(',', '.'))
  return Number.isNaN(numberValue) ? String(value).trim() : numberValue.toFixed(3)
}

/**
 * nptnhan (6/6/2026) hàm lấy dữ liệu dùng để kiểm tra thay đổi form
 */
const getComparableShift = () => ({
  shiftCode: String(shift.shiftCode || '').trim(),
  shiftName: String(shift.shiftName || '').trim(),
  beginShiftTime: normalizeTimeForCompare(shift.beginShiftTime),
  endShiftTime: normalizeTimeForCompare(shift.endShiftTime),
  beginBreakTime: normalizeTimeForCompare(shift.beginBreakTime),
  endBreakTime: normalizeTimeForCompare(shift.endBreakTime),
  workingTime: normalizeNumberForCompare(shift.workingTime),
  breakingTime: normalizeNumberForCompare(shift.breakingTime),
  shiftDescription: String(shift.shiftDescription || '').trim(),
  inActive: Boolean(shift.inActive),
})

/**
 * nptnhan (5/6/2026) hàm get shift snapshot
 */
const getShiftSnapshot = () => JSON.stringify(getComparableShift())

/**
 * nptnhan (5/6/2026) hàm update initial shift snapshot
 */
const updateInitialShiftSnapshot = () => {
  initialShiftSnapshot.value = getShiftSnapshot()
}

/**
 * nptnhan (5/6/2026) hàm has form changed
 */
const hasFormChanged = () => {
  return initialShiftSnapshot.value && getShiftSnapshot() !== initialShiftSnapshot.value
}

/**
 * nptnhan (6/6/2026) hàm cập nhật thời gian làm việc/nghỉ theo giờ trong form
 */
const updateCalculatedTimes = () => {
  const hasShiftTime = Boolean(shift.beginShiftTime && shift.endShiftTime)
  const hasBreakTime = Boolean(shift.beginBreakTime && shift.endBreakTime)

  shift.breakingTime = hasBreakTime
    ? computeBreakingTimeHours(shift.beginBreakTime, shift.endBreakTime)
    : null
  shift.workingTime = hasShiftTime
    ? computeWorkingTimeHours(
        shift.beginShiftTime,
        shift.endShiftTime,
        shift.beginBreakTime,
        shift.endBreakTime,
      )
    : null
}

/**
 * nptnhan (5/6/2026) hàm reset form
 */
const resetForm = (data = null) => {
  const normalizedData = data
    ? {
        ...data,
        shiftId: getShiftId(data),
      }
    : {}

  Object.assign(shift, new Shift(normalizedData))
  updateCalculatedTimes()
  clearErrors()
  updateInitialShiftSnapshot()
}

/**
 * nptnhan (5/6/2026) hàm focus first input
 */
const focusFirstInput = async () => {
  await nextTick()
  modalContentRef.value
    ?.querySelector('.modal-form input:not([disabled]), .modal-form textarea:not([disabled])')
    ?.focus()
}

/**
 * nptnhan (5/6/2026) hàm reset drag position
 */
const resetDragPosition = () => {
  dragPosition.left = null
  dragPosition.top = null
}

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => [props.isActive, props.shiftData],
  (value) => {
    if (value[0]) {
      resetDragPosition()
      resetForm(value[1])
      focusFirstInput()
    }
  },
  { immediate: true },
)

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => [shift.beginShiftTime, shift.endShiftTime, shift.beginBreakTime, shift.endBreakTime],
  () => {
    try {
      updateCalculatedTimes()
    } catch (e) {
      // ignore compute errors
      // console.warn('compute time error', e)
    }
  },
)

/**
 * nptnhan (5/6/2026) hàm xóa lỗi thời gian khi người dùng thay đổi giá trị
 */
watch(
  () => shift.beginBreakTime,
  () => {
    errors.beginBreakTime = ''
  },
)

/**
 * nptnhan (5/6/2026) hàm xóa lỗi thời gian khi người dùng thay đổi giá trị
 */
watch(
  () => shift.endBreakTime,
  () => {
    errors.endBreakTime = ''
  },
)
/**
 * nptnhan (2/6/2026) đóng popup
 */
const forceClosePopup = () => {
  exitConfirmActive.value = false
  emit('close')
}

/**
 * nptnhan (5/6/2026) hàm close popup có thực hiển kiểm tra thay đổi của các ô dữ liệu trước khi xóa
 */
const closePopup = () => {
  if (hasFormChanged()) {
    exitConfirmActive.value = true
    return
  }

  forceClosePopup()
}

/**
 * nptnhan (5/6/2026) hàm confirm exit without save
 */
const confirmExitWithoutSave = () => {
  forceClosePopup()
}

/**
 * nptnhan (5/6/2026) hàm get input elements
 */
const getInputElements = () => {
  if (!modalContentRef.value) return []

  return Array.from(
    modalContentRef.value.querySelectorAll(
      '.modal-form input:not([disabled]), .modal-form textarea:not([disabled])',
    ),
  ).filter((element) => element.offsetParent !== null)
}

/**
 * nptnhan (5/6/2026) hàm handle tab key
 */
const handleTabKey = (event) => {
  if (dialogActive.value || exitConfirmActive.value) return

  const inputElements = getInputElements()
  if (!inputElements.length) return

  const firstElement = inputElements[0]
  const lastElement = inputElements[inputElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
    return
  }

  if (!inputElements.includes(document.activeElement)) {
    event.preventDefault()
    firstElement.focus()
  }
}

/**
 * nptnhan (5/6/2026) hàm focus field
 */
const focusField = async (fieldName) => {
  if (!fieldName) return

  await nextTick()
  modalContentRef.value?.querySelector(`[data-field="${fieldName}"] input, [data-field="${fieldName}"] textarea`)?.focus()
}

/**
 * nptnhan (5/6/2026) hàm close error dialog
 */
const closeErrorDialog = () => {
  dialogActive.value = false
  focusField(firstErrorField.value)
}

/**
 * nptnhan (5/6/2026) hàm start drag
 */
const startDrag = (event) => {
  if (event.button !== 0 || !modalContentRef.value) return

  const rect = modalContentRef.value.getBoundingClientRect()
  dragPosition.left = rect.left
  dragPosition.top = rect.top
  dragOffset.x = event.clientX - rect.left
  dragOffset.y = event.clientY - rect.top
  isDragging.value = true

  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', stopDrag)
}

/**
 * nptnhan (5/6/2026) hàm drag
 */
const drag = (event) => {
  if (!isDragging.value || !modalContentRef.value) return

  const rect = modalContentRef.value.getBoundingClientRect()
  const maxLeft = Math.max(window.innerWidth - rect.width, 0)
  const maxTop = Math.max(window.innerHeight - rect.height, 0)

  dragPosition.left = Math.min(Math.max(event.clientX - dragOffset.x, 0), maxLeft)
  dragPosition.top = Math.min(Math.max(event.clientY - dragOffset.y, 0), maxTop)
}

/**
 * nptnhan (5/6/2026) hàm stop drag
 */
const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', stopDrag)
}

/**
 * nptnhan (5/6/2026) hàm format time
 */
const formatTime = (value) => {
  if (!value || typeof value !== 'string') return value
  if (value.length === 5 && value.indexOf(':') === 2) {
    return `${value}:00`
  }
  return value
}

/**
 * nptnhan (7/6/2026) hàm trim các giá trị chuỗi trước khi gửi API
 */
const trimPayloadStrings = (payload) => {
  Object.keys(payload).forEach((key) => {
    if (typeof payload[key] === 'string') {
      payload[key] = payload[key].trim()
    }
  })
  return payload
}

/**
 * nptnhan (5/6/2026) hàm parse time to minutes
 */
const parseTimeToMinutes = (value) => {
  if (!value) return null
  // support HH:MM or HH:MM:SS
  const t = value.length >= 5 ? value.slice(0, 5) : value
  const parts = t.split(':')
  if (parts.length < 2) return null
  const hh = parseInt(parts[0], 10)
  const mm = parseInt(parts[1], 10)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  return hh * 60 + mm
}

/**
 * nptnhan (5/6/2026) hàm validate
 */
const validate = () => {
  // clear errors
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (!shift.shiftCode || !String(shift.shiftCode).trim()) {
    errors.shiftCode = t('shift.validation.shiftCodeRequired')
  }
  if (!shift.shiftName || !String(shift.shiftName).trim()) {
    errors.shiftName = t('shift.validation.shiftNameRequired')
  }

  const b = formatTime(shift.beginShiftTime)
  const e = formatTime(shift.endShiftTime)
  if (!b) {
    errors.beginShiftTime = t('shift.validation.beginShiftTimeRequired')
  }
  if (!e) {
    errors.endShiftTime = t('shift.validation.endShiftTimeRequired')
  }

  let bm = null
  let em = null
  if (b && e) {
    bm = parseTimeToMinutes(b)
    em = parseTimeToMinutes(e)
    if (bm === null || em === null) {
      errors.beginShiftTime = errors.beginShiftTime || t('shift.validation.invalidTime')
    } else if (bm === em) {
      errors.endShiftTime = t('shift.validation.sameShiftTime')
    }
  }

  if (shift.beginBreakTime || shift.endBreakTime) {
    if (!shift.beginBreakTime) {
      errors.beginBreakTime = t('shift.validation.missingBeginBreak')
    }
    if (!shift.endBreakTime) {
      errors.endBreakTime = t('shift.validation.missingEndBreak')
    }
    if (shift.beginBreakTime && shift.endBreakTime && bm !== null && em !== null) {
      const bBreak = parseTimeToMinutes(formatTime(shift.beginBreakTime))
      const eBreak = parseTimeToMinutes(formatTime(shift.endBreakTime))
      if (bBreak === null || eBreak === null) {
        errors.beginBreakTime = errors.beginBreakTime || t('shift.validation.invalidBreakTime')
      } else {
        const shiftCrosses = em < bm
        const isTimeInShift = (minutes) =>
          shiftCrosses ? minutes >= bm || minutes <= em : minutes >= bm && minutes <= em
        const normalizeBreakTime = (minutes) =>
          shiftCrosses && minutes <= em ? minutes + 1440 : minutes
        const isBreakBeginOutside = !isTimeInShift(bBreak)
        const isBreakEndOutside = !isTimeInShift(eBreak)

        if (isBreakBeginOutside) {
          errors.beginBreakTime =
            errors.beginBreakTime ||
            t('shift.validation.breakBeginInShift')
        }
        if (isBreakEndOutside) {
          errors.endBreakTime =
            errors.endBreakTime ||
            t('shift.validation.breakEndInShift')
        }
        if (!isBreakBeginOutside && !isBreakEndOutside) {
          const bNorm = normalizeBreakTime(bBreak)
          const eNorm = normalizeBreakTime(eBreak)
          if (bNorm >= eNorm) {
            errors.endBreakTime = t('shift.validation.breakEndAfterBegin')
          }
        }
      }
    }
  }

  const workingTime = parseNumberValue(shift.workingTime)
  if (b && e && bm !== null && em !== null && workingTime !== null && workingTime <= 0) {
    errors.workingTime = 'Thời gian làm việc phải lớn hơn 0.'
  }

  const fieldOrder = [
    'shiftCode',
    'shiftName',
    'beginShiftTime',
    'endShiftTime',
    'beginBreakTime',
    'endBreakTime',
    'workingTime',
    'breakingTime',
    'shiftDescription',
  ]
  const firstField = fieldOrder.find((field) => errors[field])
  if (firstField) {
    duplicateShiftCode.value = ''
    firstErrorField.value = firstField
    dialogMessage.value = errors[firstField]
    dialogActive.value = true
    return false
  }
  return true
}

/**
 * nptnhan (5/6/2026) hàm show save error
 */
const showSaveError = (responseData) => {
  if (responseData?.userMessage === 'DuplicateCode') {
    duplicateShiftCode.value = String(shift.shiftCode || '').trim()
    errors.shiftCode = t('shift.messages.duplicateInline', { code: duplicateShiftCode.value })
    firstErrorField.value = 'shiftCode'
    dialogMessage.value = errors.shiftCode
  } else {
    duplicateShiftCode.value = ''
    firstErrorField.value = ''
    dialogMessage.value = responseData?.userMessage || t('shift.messages.saveError')
  }

  dialogActive.value = true
}

/**
 * nptnhan (5/6/2026) hàm save shift
 */
const saveShift = async (savedMode = null) => {
  const payload = JSON.parse(JSON.stringify(shift))
  trimPayloadStrings(payload)

  if (isEditMode.value) {
    payload.shiftId = getShiftId(payload) || getShiftId(props.shiftData)
  }
  if (payload.shiftId === null) {
    delete payload.shiftId
  }

  payload.beginShiftTime = formatTime(payload.beginShiftTime)
  payload.endShiftTime = formatTime(payload.endShiftTime)
  if (payload.beginBreakTime) {
    payload.beginBreakTime = formatTime(payload.beginBreakTime)
  }
  if (payload.endBreakTime) {
    payload.endBreakTime = formatTime(payload.endBreakTime)
  }

  if (payload.beginShiftTime === '') delete payload.beginShiftTime
  if (payload.endShiftTime === '') delete payload.endShiftTime
  if (payload.beginBreakTime === '') delete payload.beginBreakTime
  if (payload.endBreakTime === '') delete payload.endBreakTime

  console.log('Saving shift with payload:', payload)
  try {
    const response = isEditMode.value ? await ShiftAPI.update(payload) : await ShiftAPI.add(payload)
    if (response?.data?.isSuccess === true) {
      emit('saved', savedMode || (isEditMode.value ? 'edit' : 'add'), response.data.data || payload)
      return true
    }
    showSaveError(response?.data)
  } catch (error) {
    showSaveError(error?.response?.data)
    console.error('Save shift error', error)
  }
  return false
}

/**
 * nptnhan (5/6/2026) hàm save
 */
const save = async () => {
  if (isEditMode.value && !hasFormChanged()) {
    forceClosePopup()
    return
  }
  if (!validate()) return
  if (await saveShift()) {
    forceClosePopup()
  }
}

/**
 * nptnhan (5/6/2026) hàm save and add
 */
const saveAndAdd = async () => {
  if (isEditMode.value && !hasFormChanged()) {
    resetForm()
    return
  }
  if (!validate()) return
  const savedMode = isEditMode.value ? 'edit-and-add' : 'add'
  if (await saveShift(savedMode)) {
    resetForm()
  }
}

/**
 * nptnhan (5/6/2026) hàm handle shortcut
 */
const handleShortcut = (event) => {
  if (!props.isActive) return

  if (event.key === 'Escape') {
    if (dialogActive.value || exitConfirmActive.value) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    closePopup()
    return
  }

  if (dialogActive.value || exitConfirmActive.value) return

  const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
  if (!isSaveShortcut) return

  event.preventDefault()
  if (event.shiftKey) {
    saveAndAdd()
  } else {
    save()
  }
}

/**
 * nptnhan (5/6/2026) hàm xử lý khi component được khởi tạo
 */
onMounted(() => {
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut)
  stopDrag()
})
</script>
<style scoped>
.modal-container {
  position: fixed;
  inset: 0;
  z-index: 1000;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
  background-color: black;
  opacity: 0.4;
}
.modal-content {
  position: fixed;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease-in-out;
  width: min(680px, calc(100vw - 40px));
  touch-action: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  z-index: 1001;
}
.modal-content.is-dragging {
  transition: none;
}
.modal-title {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  align-items: center;
  height: 68px;
  cursor: move;
  user-select: none;
}
.modal-title-btn {
  cursor: default;
}
.modal-title-text {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  color: #000;
  cursor: text;
}
.modal-title-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}
.duplicate-shift-code {
  font-weight: 700;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  width: 100%;
  flex: 0 0 auto;
}
.form-row {
  display: flex;
  width: 100%;
  min-width: 0;
  flex: 0 0 auto;
}
.form-row.col-2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}
.form-row > * {
  min-width: 0;
}
.form-row-status {
  min-height: 28px;
}
</style>
