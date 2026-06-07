<template>
  <div class="header">
    <div class="header-left">
      <div class="item-logo">
        <div class="logo-menu icon24" v-tooltip.bottom="t('header.allApps')"></div>
        <div class="home">
          <div class="logo-item"></div>
          <div class="logo-text">{{ t('header.product') }}</div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="header-right-content">
        <div class="content-left">
          <div class="name-company" v-tooltip.bottom="t('header.companyName')">{{ t('header.companyName') }}</div>
          <div class="icon-drop-down-small icon16"></div>
        </div>
        <div class="content-right">
          <template v-for="item in icons" :key="item.key">
            <div v-if="item.type === 'separator'" class="nav-separator"></div>
            <div v-else :class="item.wrapper" v-tooltip.bottom="item.label" @click="handleIconClick(item)">
              <div :class="item.inner"></div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
 
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
 /**
  đây là branch mớ
   */
const { t } = useI18n()
const router = useRouter()
/**
 * nptnhan (5/6/2026) hàm tính icons
 */
const icons = computed(() => [
  { key: 'export', wrapper: 'icon-function export icon-hover', inner: 'icon-export icon24', label: t('common.exportExcel') },
  { key: 'qtsx', wrapper: 'icon-function', inner: 'icon-qtsx icon24', label: t('header.inventoryLookup') },
  { key: 'reminder', wrapper: 'icon-function', inner: 'icon-reminder icon24', label: t('header.smartReminder') },
  { key: 'separator', type: 'separator' },
  { key: 'setting', wrapper: 'icon-function icon-hover', inner: 'icon-setting icon24', label: t('header.setting') },
  { key: 'notification', wrapper: 'icon-function', inner: 'icon-notification icon24', label: t('header.notification') },
  { key: 'question', wrapper: 'icon-function', inner: 'icon-question icon24', label: t('common.help') },
  { key: 'dots', wrapper: 'icon-function', inner: 'icon-dots-circle icon24', label: t('header.moreFeatures') },
  { key: 'profile', wrapper: 'icon-function profile', inner: 'icon-profile' },
])

/**
 * nptnhan (5/6/2026) hàm handle icon click
 */
const handleIconClick = (item) => {
  if (item.key === 'setting') {
    router.push({ name: 'setup' })
  }
}
</script>
<style scoped>
.header {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--color-bg-header);
  height: 48px;
  border-bottom: 1px solid rgba(0, 0, 0, 0);
}
.header-left {
  display: flex;
  align-items: center;
  margin-right: 16px;
  padding-left: 16px;
}
.item-logo {
  display: flex;
  align-items: center;
}
.logo-menu .icon24 {
  align-self: center;
  cursor: pointer;
}
.home {
  display: flex;
  align-items: center;
  margin-left: 16px;
  width: 140px;
  cursor: pointer;
}
.logo-text {
  margin-left: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}
.header-right {
  padding-left: 20px;
  padding-right: 16px;
  flex: 1;
}
.header-right-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
.content-left {
  display: flex;
  margin-top: 2px;
  cursor: pointer;
}
.name-company {
  font-size: 13px;
  color: #fff;
  margin-right: 4px;
}
.content-right {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.icon-function {
  margin-left: 12px;
  cursor: pointer;
}
.icon-function.export {
  margin-left: 0px;
}
.icon-function.profile {
  margin-left: 16px;
}
.nav-separator {
  width: 1px;
  height: 16px;
  background-color: rgba(255, 255, 255, 0.3);
  align-self: center;
  border-radius: 1px;
  margin-left: 12px;
}
.icon-hover:hover {
  background-color: #ffffff26;
  border-radius: 50%;
}
</style>
