<template>
    <div class="sidebar-wrap" :class="{ 'sidebar-collapsed': isCollapsed }">
        <div class="sidebar-container">
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-dashboard icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.dashboard') }}</div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-order icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.orders') }}</div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-plan icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.productionPlan') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-coordinate icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.coordination') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-quality-control icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.qualityControl') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-material-factory icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.materials') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-plan-cost icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.planCost') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-outsourcing icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.outsourcing') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item-line">
               
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-production-report icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.reports') }}</div>
            </div>
            <div class="sidebar-menu-item-line">
                
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-product-material icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.productMaterials') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-process icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.process') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-menu-item">
                <div class="menu-item-icon"><div class="icon-production-capacity icon20"></div></div>
                <div class="menu-item-title">{{ t('sidebar.capacity') }}</div>
                <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
            </div>
            <div class="sidebar-submenu-wrap">
                <div class="sidebar-menu-item category-menu-item">
                    <div class="menu-item-icon"><div class="icon-production-category icon20"></div></div>
                    <div class="menu-item-title">{{ t('sidebar.otherCategories') }}</div>
                    <div class="flex-end"><div class="icon-dropdown icon20"></div></div>
                </div>
                <div class="category-submenu">
                    <div class="submenu-column">
                        <div class="submenu-title">{{ t('sidebar.objects') }}</div>
                        <RouterLink class="submenu-item" to="/production-category/customers">{{ t('sidebar.customers') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/suppliers">{{ t('sidebar.suppliers') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/employees">{{ t('sidebar.employees') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/cost-objects">{{ t('sidebar.costObjects') }}</RouterLink>
                    </div>
                    <div class="submenu-column">
                        <div class="submenu-title">{{ t('sidebar.workSchedule') }}</div>
                        <RouterLink class="submenu-item" to="/production-category/shifts">{{ t('sidebar.shifts') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/holidays">{{ t('sidebar.holidays') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/work-calendars">{{ t('sidebar.workCalendars') }}</RouterLink>
                    </div>
                    <div class="submenu-column">
                        <div class="submenu-title">{{ t('sidebar.other') }}</div>
                        <RouterLink class="submenu-item" to="/production-category/organizations">{{ t('sidebar.organizations') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/warehouses">{{ t('sidebar.warehouses') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/units">{{ t('sidebar.units') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/stop-reasons">{{ t('sidebar.stopReasons') }}</RouterLink>
                        <RouterLink class="submenu-item" to="/production-category/currencies">{{ t('sidebar.currencies') }}</RouterLink>
                    </div>
                </div>
            </div>
        </div>
        <div class="btn-collapse" @click="toggleSidebar">
            <div class="icon-collapse icon20"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const SIDEBAR_STATE_KEY = 'misa-sidebar-collapsed'
const EXPANDED_WIDTH = '248px'
const COLLAPSED_WIDTH = '64px'
const isCollapsed = ref(false)

/**
 * nptnhan (5/6/2026) hàm apply sidebar width
 */
const applySidebarWidth = () => {
    document.documentElement.style.setProperty(
        '--sidebar-width',
        isCollapsed.value ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
    )
}

/**
 * nptnhan (5/6/2026) hàm toggle sidebar
 */
const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
}

/**
 * nptnhan (5/6/2026) hàm xử lý khi component được khởi tạo
 */
onMounted(() => {
    isCollapsed.value = localStorage.getItem(SIDEBAR_STATE_KEY) === 'true'
    applySidebarWidth()
})

/**
 * nptnhan (5/6/2026) hàm theo dõi thay đổi dữ liệu
 */
watch(isCollapsed, (value) => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(value))
    applySidebarWidth()
})
</script>

<style scoped>
.sidebar-wrap{
    position: absolute;
    background-color: #ffffff;
    top: 48px;
    left: 0;
    bottom: 0;
    width: var(--sidebar-width, 248px);
    color: #101828;
    white-space: nowrap;
    border-right: 1px solid #E9EAEB;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: width 0.2s ease;
}
.sidebar-container{
    padding: 16px;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    flex:1;
    overflow: visible;
    scrollbar-width: none;
}
.sidebar-menu-item{
    height: 32px;
    padding: 8px 12px;
    font-size: 13px;
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
}
.sidebar-collapsed .sidebar-container {
    padding: 16px 12px;
    align-items: center;
}
.sidebar-collapsed .sidebar-menu-item {
    width: 40px;
    justify-content: center;
    padding: 8px;
}
.sidebar-collapsed .menu-item-title,
.sidebar-collapsed .flex-end {
    display: none;
}
.sidebar-collapsed .sidebar-menu-item-line {
    width: 40px;
}
.sidebar-collapsed:not(:hover) .category-submenu,
.sidebar-collapsed:not(:hover) .sidebar-submenu-wrap::after {
    display: none !important;
}
.sidebar-collapsed:hover {
    width: 248px;
    box-shadow: 4px 0 12px rgba(16, 24, 40, 0.12);
}
.sidebar-collapsed:hover .sidebar-container {
    padding: 16px;
    align-items: stretch;
}
.sidebar-collapsed:hover .sidebar-menu-item {
    width: 100%;
    justify-content: flex-start;
    padding: 8px 12px;
}
.sidebar-collapsed:hover .menu-item-title {
    display: block;
}
.sidebar-collapsed:hover .flex-end {
    display: flex;
}
.sidebar-collapsed:hover .sidebar-menu-item-line {
    width: 100%;
}
.sidebar-menu-item:hover{
    background-color: rgba(0, 0, 0, .05);;
    cursor: pointer;
    border-radius: 8px;
}
.sidebar-submenu-wrap {
    position: relative;
}
.sidebar-submenu-wrap::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 0;
    width: 20px;
    height: 304px;
    display: none;
}
.sidebar-submenu-wrap:hover::after {
    display: block;
}
.category-menu-item {
    border-radius: 8px;
    background-color: #E6F5EF;
    color: #0e9a62 !important;
}

.sidebar-submenu-wrap{
    cursor: pointer;
    border-radius: 8px;
}
.sidebar-menu-item.category-menu-item:hover {
     background-color: #E6F5EF;
    cursor: pointer;
    border-radius: 8px;
    color: #0e9a62 !important;
}
.sidebar-menu-item.category-menu-item .menu-item-icon .icon20,
.sidebar-submenu-wrap:hover .category-menu-item .menu-item-icon .icon20,
.sidebar-submenu-wrap:hover .category-menu-item .flex-end .icon20 {
    background-color: #0e9a62;
}
.category-menu-item .flex-end .icon-dropdown {
    transition: transform 0.2s ease, background-color 0.2s ease;
    transform: rotate(-90deg);
    background-color: #0e9a62;
}
.category-submenu {
    position: absolute;
    left: calc(100% + 20px);
    top: 0;
    display: none;
    grid-template-columns: 220px 145px 196px;
    column-gap: 8px;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
    z-index: 1000;
}
.sidebar-submenu-wrap:hover .category-submenu {
    display: grid;
}
.submenu-column {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
}
.submenu-title {
    height:32px;
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    line-height: 14px;
    color: #101828;
    padding: 0 32px;
}
.submenu-item {
    height:32px;
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 400;
    line-height: 14px;
    color: #101828;
    padding: 0 32px;
    cursor: pointer;
    text-decoration: none;
}
.submenu-item:hover
{
    background: rgba(0, 0, 0, .05);
    color: #0e9a62;
    border-radius: 4px;
}
.submenu-item-active,.submenu-item.router-link-active {
    color: #0e9a62;
    border-radius: 4px;
    background-color:#E6F5EF ;
}

.flex-end{
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.menu-item-title{
    z-index: 1;
    font-weight: 500;
    white-space: nowrap;
    max-width: 170px;
    min-width: 132px;
}
.sidebar-menu-item-line{
    margin: 4px auto;
    width: 100%;
    border-bottom: 1px solid #E9EAEB;
}
.btn-collapse{
    flex-shrink: 0;
    align-self: flex-end;
    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FAFAFA;
    border-top: 1px solid #E9EAEB;
    border-left: 1px solid #E9EAEB;
    border-top-left-radius: 8px;
    align-self: flex-end;
}
.btn-collapse:hover{
    background-color: rgba(0, 0, 0, .05);
    cursor: pointer;
}
.btn-collapse:hover .icon-collapse{
    background-color:#0e9a62 ;
   
}
.sidebar-collapsed .btn-collapse .icon-collapse {
    transform: rotate(180deg);
}
</style>
