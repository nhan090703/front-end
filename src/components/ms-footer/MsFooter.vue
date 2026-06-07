<template>
  <div class="ms-footer">
    <MsButton class="cancel-btn" @click="onCancel">{{ t('common.cancel') }}</MsButton>
    <MsButton
      v-if="showSaveAndAdd"
      class="save-and-add-btn"
      @click="onSaveAndAdd"
      v-tooltip.top="'Ctrl + Shift + S'"
    >
      {{ t('common.saveAndAdd') }}
    </MsButton>
    <MsButton class="save-btn" @click="onSave" v-tooltip.top="'Ctrl + S'">{{ t('common.save') }}</MsButton>
  </div>
</template>

<script setup>
import MsButton from '@/components/ms-button/MsButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  showSaveAndAdd: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['cancel', 'save-and-add', 'save'])

/**
 * nptnhan (5/6/2026) hàm on cancel
 */
const onCancel = () => {
  emit('cancel')
}

/**
 * nptnhan (5/6/2026) hàm on save and add
 */
const onSaveAndAdd = () => {
  emit('save-and-add')
}

/**
 * nptnhan (5/6/2026) hàm on save
 */
const onSave = () => {
  emit('save')
}
</script>

<style scoped>
.ms-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  gap: 8px;
  border-top: 1px solid #d5d7da;
}

.cancel-btn,
.save-and-add-btn {
  border: 1px solid #d5d7da;
  color: #000;
  background-color: #fff;
}

.cancel-btn:hover,
.save-and-add-btn:hover {
 background-color: #f3f4f6;
}
.save-btn {
  background-color: #0e9a62;
  color: #fff;
  border: none;
}
.save-btn:hover{
  background-color: #0a724b;
}
</style>
