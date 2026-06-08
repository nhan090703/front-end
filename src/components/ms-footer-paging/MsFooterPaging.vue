<template>
  <div class="body-list-footer">
    <div class="total-count">
      <div>{{ t('common.total') }}&nbsp;</div>
      <strong>{{ totalRecord }}</strong>
    </div>
    <div class="pagination">
      <div class="page-size-title">{{ t('common.rowsPerPage') }}</div>
      <div class="page-size-component">
        <MsSelectBox v-model="selectedPageSize" :options="pageSizeOptions"></MsSelectBox>
      </div>
      <div class="page-info">
        <strong>{{ startRecord }} - {{ endRecord }}</strong>
      </div>
      <div class="action-btn">
        <div class="first-page-btn">
          <MsButton @click="goFirstPage" :class="{ disabled: page === 1 }" class="normal-status">
            <div class="icon-first-page icon16"></div>
          </MsButton>
        </div>
        <div class="prev-page-btn">
          <MsButton @click="goPrevPage" :class="{ disabled: page === 1 }" class="normal-status">
            <div class="icon-prev-page icon16"></div>
          </MsButton>
        </div>
        <div class="next-page-btn">
          <MsButton
            @click="goNextPage"
            :class="{ disabled: page === totalPages }"
            class="normal-status"
          >
            <div class="icon-next-page icon16"></div>
          </MsButton>
        </div>
        <div class="last-page-btn">
          <MsButton
            @click="goLastPage"
            :class="{ disabled: page === totalPages }"
            class="normal-status"
          >
            <div class="icon-last-page icon16"></div>
          </MsButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MsButton from '@/components/ms-button/MsButton.vue'
import MsSelectBox from '@/components/ms-select-box/MsSelectBox.vue'

const { t } = useI18n()

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  totalRecord: {
    type: Number,
    default: 0,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [
      { id: 5, name: '5' },
      { id: 10, name: '10' },
      { id: 20, name: '20' },
      { id: 50, name: '50' },
      { id: 100, name: '100' },
    ],
  },
})

const emit = defineEmits(['page-change', 'update:pageSize'])

const selectedPageSize = computed({
  get: () => props.pageSize,
  set: (value) => {
    emit('update:pageSize', value)
  },
})

const totalPages = computed(() => {
  return props.totalRecord === 0 ? 1 : Math.ceil(props.totalRecord / props.pageSize)
})

const startRecord = computed(() => {
  return props.totalRecord === 0 ? 0 : (props.page - 1) * props.pageSize + 1
})

const endRecord = computed(() => {
  return Math.min(props.page * props.pageSize, props.totalRecord)
})

const goToPage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value || newPage === props.page) {
    return
  }
  emit('page-change', newPage)
}

const goFirstPage = () => {
  goToPage(1)
}

const goPrevPage = () => {
  goToPage(props.page - 1)
}

const goNextPage = () => {
  goToPage(props.page + 1)
}

const goLastPage = () => {
  goToPage(totalPages.value)
}
</script>

<style scoped>
.body-list-footer {
  height: 48px;
  border-top: solid 1px #d5d7da;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  justify-content: space-between;
}
.total-count {
  display: flex;
  font-size: 13px;
}
.pagination {
  display: flex;
  font-size: 13px;
  gap: 16px;
  align-items: center;
  min-width: 350px;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}
.first-page-btn,
.prev-page-btn,
.next-page-btn,
.last-page-btn {
  margin: 2px;
}
.page-size-component {
  width: 80px;
}
.disabled {
  cursor: not-allowed;
  background-color: #fff;
}
.disabled:hover {
  cursor: not-allowed;
  background-color: #f3f4f6;
  opacity: 0.5;
}
.disabled div {
  cursor: not-allowed;
  background-color: #d5d7da;
}
.normal-status {
  background-color: #fff;
}
.normal-status:hover {
  background-color: #f3f4f6;
}
</style>
