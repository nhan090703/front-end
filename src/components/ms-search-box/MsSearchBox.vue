<template>
  <div class="ms-search-box">
    <div class="icon-left"><div class="icon-search icon16"></div></div>
    <input
      type="text"
      class="input-text"
      :placeholder="t('common.search')"
      v-model="keyword"
      @input="onSearch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const keyword = ref('')
const emit = defineEmits(['search'])
const { t } = useI18n()

let timer = null

/**
 * nptnhan (5/6/2026) hàm on search
 */
function onSearch() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    emit('search', keyword.value)
  }, 1000)
}
</script>

<style scoped>
.ms-search-box {
  display: flex;
  height: 28px;
  align-items: center;
  width: 200px;
  gap: 4px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #fff;
  padding: 5px 12px;
}
.ms-search-box:hover {
  border: 1px solid #9ca3af;
}
.ms-search-box:focus-within {
  border: 1px solid #0e9a62;
}
.icon-left {
  margin-right: 4px;
  cursor: pointer;
}
.icon-search {
  -webkit-mask-image: url('https://qtsxcdng2.misacdn.net/assets/pas.Icon Warehouse-e29a964d.svg?v=12.1.0.3');
  -webkit-mask-position: 0px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #4b5563;
  width: 16px;
  height: 16px;
}
.input-text {
  outline: none;
  border: none;
  padding: 0;
  color: #101828;
  font-size: 13px;
  font-weight: 400;
  flex: 1;
  min-width: 0;
}
</style>
