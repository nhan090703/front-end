<script setup>
import TheHeader from './layouts/TheHeader.vue';
import TheSideBar from './layouts/TheSideBar.vue';
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
/**
 * nptnhan (5/6/2026) hàm tính show sidebar
 */
const showSidebar = computed(() => !route.meta.hideSidebar)
</script>

<template>
  <TheHeader></TheHeader>
  <TheSideBar v-if="showSidebar"></TheSideBar>
  <RouterView></RouterView>
</template>

<style scoped></style>
