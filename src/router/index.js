import { createRouter, createWebHistory } from 'vue-router'
import ShiftIndex from '@/views/ProductionCategory/Shift/ShiftIndex.vue'
import Category from '@/views/ProductionCategory/Category.vue'
import Setup from '@/views/System/Setup.vue'
import DocumentCodeRule from '@/views/System/DocumentCodeRule.vue'
import ChangeLog from '@/views/System/ChangeLog.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/production-category/shifts',
    },
    {
      path: '/production-category',
      redirect: '/production-category/shifts',
    },
    {
      path: '/production-category/customers',
      name: 'customers',
      component: Category,
      meta: { titleKey: 'sidebar.customers' },
    },
    {
      path: '/production-category/suppliers',
      name: 'suppliers',
      component: Category,
      meta: { titleKey: 'sidebar.suppliers' },
    },
    {
      path: '/production-category/employees',
      name: 'employees',
      component: Category,
      meta: { titleKey: 'sidebar.employees' },
    },
    {
      path: '/production-category/cost-objects',
      name: 'cost-objects',
      component: Category,
      meta: { titleKey: 'sidebar.costObjects' },
    },
    {
      path: '/production-category/shifts',
      name: 'shifts',
      component: ShiftIndex,
    },
    {
      path: '/production-category/holidays',
      name: 'holidays',
      component: Category,
      meta: { titleKey: 'sidebar.holidays' },
    },
    {
      path: '/production-category/work-calendars',
      name: 'work-calendars',
      component: Category,
      meta: { titleKey: 'sidebar.workCalendars' },
    },
    {
      path: '/production-category/organizations',
      name: 'organizations',
      component: Category,
      meta: { titleKey: 'sidebar.organizations' },
    },
    {
      path: '/production-category/warehouses',
      name: 'warehouses',
      component: Category,
      meta: { titleKey: 'sidebar.warehouses' },
    },
    {
      path: '/production-category/units',
      name: 'units',
      component: Category,
      meta: { titleKey: 'sidebar.units' },
    },
    {
      path: '/production-category/stop-reasons',
      name: 'stop-reasons',
      component: Category,
      meta: { titleKey: 'sidebar.stopReasons' },
    },
    {
      path: '/production-category/currencies',
      name: 'currencies',
      component: Category,
      meta: { titleKey: 'sidebar.currencies' },
    },
    {
      path: '/system/setup',
      name: 'setup',
      component: Setup,
      meta: { hideSidebar: true },
    },
    {
      path: '/system/document-code-rules',
      name: 'document-code-rules',
      component: DocumentCodeRule,
      meta: { hideSidebar: true },
    },
    {
      path: '/system/change-logs',
      name: 'change-logs',
      component: ChangeLog,
      meta: { hideSidebar: true },
    },
  ],
})

export default router
