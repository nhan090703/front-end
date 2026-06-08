<template>
  <div class="wrapper">
    <div class="setup-header">
      <div class="icon-back-arrow icon20" @click="goBack"></div>
      <div class="setup-tilte">{{ t('header.setting') }}</div>
    </div>
    <div class="setup-content">
      <div class="setup-item">
        <div class="setup-item-title">
          <div class="icon-format icon24"></div>
          <div class="item-title">{{ t('setup.format') }}</div>
        </div>
        <div class="setup-item-option setup-item-option--menu" @click.stop="toggleLanguageMenu">
          <div class="setup-option-label">{{ t('setup.language') }}</div>
          <div class="setup-option-value">
            {{ currentLanguageLabel }}
            <div class="icon-dropdown icon16"></div>
          </div>
          <div v-if="languageMenuActive" class="language-menu">
            <div
              v-for="option in languageOptions"
              :key="option.id"
              class="language-option"
              :class="{ active: locale === option.id }"
              @click.stop="changeLanguage(option.id)"
            >
              {{ option.name }}
            </div>
          </div>
        </div>
        <div class="setup-item-option setup-item-option--link" @click="openDocumentCodeRule">
          {{ t('setup.numberingRule') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t, locale } = useI18n()
const languageMenuActive = ref(false)
const languageOptions = [
  { id: 'vi', name: 'Tiếng Việt' },
  { id: 'en', name: 'English' },
]

/**
 * nptnhan (5/6/2026) hàm tính current language label
 */
const currentLanguageLabel = computed(() => {
  return languageOptions.find((option) => option.id === locale.value)?.name || languageOptions[0].name
})

/**
 * nptnhan (5/6/2026) hàm go back
 */
const goBack = () => {
  router.push({ name: 'shifts' })
}

/**
 * nptnhan (8/6/2026) hàm mở màn hình quy tắc đánh số chứng từ
 */
const openDocumentCodeRule = () => {
  router.push('/system/document-code-rules')
}

/**
 * nptnhan (5/6/2026) hàm toggle language menu
 */
const toggleLanguageMenu = () => {
  languageMenuActive.value = !languageMenuActive.value
}

/**
 * nptnhan (5/6/2026) hàm change language
 */
const changeLanguage = (language) => {
  locale.value = language
  localStorage.setItem('misa-locale', language)
  languageMenuActive.value = false
}

/**
 * nptnhan (5/6/2026) hàm close language menu
 */
const closeLanguageMenu = () => {
  languageMenuActive.value = false
}

/**
 * nptnhan (5/6/2026) hàm xử lý khi component được khởi tạo
 */
onMounted(() => {
  document.addEventListener('click', closeLanguageMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeLanguageMenu)
})
</script>

<style>
.wrapper{
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
}
.setup-header{
    padding: 0 16px;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 4px;
    border-bottom: 1px solid #E5E7EB;
}
.setup-tilte{
    font-size: 20px;
    font-weight: 600;
    color: #101828;
    font-family: Inter;
    margin-left: 8px;
}
.setup-item{
    width: 404px;
    height: 240px;
    background-color: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;

}
.setup-content{
    padding: 16px;
    background-color: #e5e7eb;
    color: #101828;
    font-size: 13px;
    font-weight: 400;
    flex: 1;
}
.item-title{
    font-weight: 600;
}
.setup-item-title{
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.setup-item-option{
    padding: 8px 0;
    margin-left: 31px;
    min-height: 32px;
    display: flex;
    align-items: center;
}
.setup-item-option--link,
.setup-item-option--menu {
    cursor: pointer;
    border-radius: 6px;
}
.setup-item-option--link:hover {
    background-color: #f3f4f6;
    color: #0e9a62;
}
.setup-item-option--menu {
    position: relative;
    justify-content: space-between;
    padding-right: 8px;
}
.setup-item-option--menu:hover {
    background-color: #f3f4f6;
}
.setup-option-label {
    min-width: 0;
}
.setup-option-value {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #101828;
}
.language-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 8px;
    width: 160px;
    padding: 4px;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.12);
    z-index: 10;
}
.language-option {
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
}
.language-option:hover,
.language-option.active {
    background-color: #e6f5ef;
    color: #0e9a62;
}
</style>
