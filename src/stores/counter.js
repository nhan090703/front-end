import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  /**
   * nptnhan (5/6/2026) hàm tính double count
   */
  const doubleCount = computed(() => count.value * 2)
  /**
   * nptnhan (5/6/2026) hàm increment
   */
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
