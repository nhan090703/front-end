<template>
  <div class="main-view">
    <div class="placeholder-content">
      <div class="placeholder-title">{{ t(route.meta.titleKey || '') }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
</script>

<style scoped>
.main-view {
  position: absolute;
  background-color: #e5e7eb;
  top: 48px;
  left: var(--sidebar-width, 248px);
  right: 0;
  bottom: 0;
  padding: 16px 20px 20px;
}
.placeholder-content {
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
}
.placeholder-title {
  font-size: 20px;
  font-weight: 700;
  color: #101828;
}
</style>
