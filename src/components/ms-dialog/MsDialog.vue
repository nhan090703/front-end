<template>
  <div class="modal-container" v-if="isActive">
    <div class="modal-overlay" @click.self="closeDialog"></div>
    <div
      ref="dialogWrapperRef"
      class="dialog-wrapper"
      :class="{ 'is-dragging': isDragging }"
      :style="dialogWrapperStyle"
    >
      <div class="dialog-header" @mousedown="startDrag">
        <div class="dialog-header-left">
          <template v-if="isInfoDialog"><div class="icon-danger icon-info"></div></template>
          <template v-else-if="duplicateShiftCode"><div class="icon-warning"></div></template>
          <template v-else><div class="icon-danger"></div></template>
          <div class="dialog-title">{{ title }}</div>
        </div>
        <div class="dialog-header-right" @mousedown.stop>
          <div class="icon-close icon20" @click="closeDialog"></div>
        </div>
      </div>
      <div class="dialog-content">
        <slot></slot>
      </div>
      <div class="dialog-footer">
        <template v-if="isConfirm">
          <MsButton class="cancel-btn" @click="closeDialog">{{ cancelText }}</MsButton>
          <MsButton :class="isInfoDialog ? 'confirm-info-btn' : 'save-btn'" @click="confirmDialog">
            {{ confirmText }}
          </MsButton>
        </template>
        <template v-else>
          <MsButton class="close-btn" @click="closeDialog">{{ t('common.close') }}</MsButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import MsButton from '../ms-button/MsButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
  isConfirm: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '',
  },
  duplicateShiftCode:{
    type:Boolean,
    default:false
  },
  dialogType: {
    type: String,
    default: 'danger',
  },
})

const emit = defineEmits(['close', 'confirm'])
const dialogWrapperRef = ref(null)
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
 * nptnhan (5/6/2026) hàm tính dialog wrapper style
 */
const dialogWrapperStyle = computed(() => {
  if (dragPosition.left === null || dragPosition.top === null) return {}

  return {
    left: `${dragPosition.left}px`,
    top: `${dragPosition.top}px`,
    transform: 'none',
  }
})
/**
 * nptnhan (5/6/2026) hàm tính is info dialog
 */
const isInfoDialog = computed(() => props.dialogType === 'info')
/**
 * nptnhan (5/6/2026) hàm tính cancel text
 */
const cancelText = computed(() => props.cancelText || t('common.cancel'))
/**
 * nptnhan (5/6/2026) hàm tính confirm text
 */
const confirmText = computed(() => props.confirmText || t('common.confirm'))

/**
 * nptnhan (5/6/2026) hàm close dialog
 */
const closeDialog = () => {
  emit('close')
}

/**
 * nptnhan (5/6/2026) hàm confirm dialog
 */
const confirmDialog = () => {
  emit('confirm')
}

/**
 * nptnhan (5/6/2026) hàm reset drag position
 */
const resetDragPosition = () => {
  dragPosition.left = null
  dragPosition.top = null
}

/**
 * nptnhan (5/6/2026) hàm start drag
 */
const startDrag = (event) => {
  if (event.button !== 0 || !dialogWrapperRef.value) return

  const rect = dialogWrapperRef.value.getBoundingClientRect()
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
  if (!isDragging.value || !dialogWrapperRef.value) return

  const rect = dialogWrapperRef.value.getBoundingClientRect()
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
 * nptnhan (5/6/2026) hàm handle shortcut
 */
const handleShortcut = (event) => {
  if (!props.isActive || event.key !== 'Escape') return

  event.preventDefault()
  event.stopImmediatePropagation()
  closeDialog()
}

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(
  () => props.isActive,
  (value) => {
    if (value) {
      resetDragPosition()
    }
  },
)

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
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
  background-color: black;
  opacity: 0.4;
}
.dialog-wrapper {
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease-in-out;
  width: 432px;
  touch-action: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  z-index: 9999;
  padding: 16px;
}
.dialog-wrapper.is-dragging {
  transition: none;
}
.icon-warning {
  -webkit-mask-image: url('https://demoqtsxcdn.misacdn.net/assets/pas.qtsx_icon-d81b89bb.svg?v=12.1.0.4');
  -webkit-mask-position: -188px -169px;
  -webkit-mask-repeat: no-repeat;
  background-color: #f79009;
  width: 20px;
  height: 20px;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  height: 24px;
  cursor: move;
  user-select: none;
}
.dialog-header-right {
  cursor: default;
}
.dialog-header-left {
  display: flex;
  gap: 8px;
}
.save-btn {
  background-color: #f04438;
  color: #fff;
}
.save-btn:hover {
  background-color: #d92d20;
}
.confirm-info-btn {
  background-color: #0e9a62;
  color: #fff;
}
.confirm-info-btn:hover {
  background-color: #0a724b;
}
.cancel-btn {
  background-color: #fff;
  border: 1px solid #D5D7DA;
  color: #000;
}
.cancel-btn:hover {
  background-color: #f5f5f5;
}
.close-btn{
  background-color: #0e9a62;
  color: #fff;
  border: none;
}
.close-btn:hover{
  background-color: #0a724b;
}
.dialog-title{
    font-weight: 600;
    color: #101828;
    font-size: 16px;
}
.dialog-footer{
    display:flex;
    justify-content: flex-end;
    gap: 8px;
}
.dialog-content{
    margin: 16px 0px;
    font-size: 13px;
    max-height: 400px;
    overflow-y: auto;
    font-weight: 400;
    line-height: 20px;
    max-width: 100%;
    overflow-wrap: anywhere;
}

.icon-danger{
  -webkit-mask-image: url('https://demoqtsxcdn.misacdn.net/assets/pas.qtsx_icon-d81b89bb.svg?v=12.1.0.4');
  -webkit-mask-position: -249px -168px;
  -webkit-mask-repeat: no-repeat;
  background-color: #f04438;
  width: 20px;
  height: 20px;
}
.icon-info {
  background-color: #2e90fa;
}

</style>
