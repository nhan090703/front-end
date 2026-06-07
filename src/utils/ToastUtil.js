import { ref } from 'vue'

/**
 * nptnhan (5/6/2026) hàm use toast
 */
export function useToast() {
  const toastActive = ref(false)
  const toastMessage = ref('')
  let toastTimeout = null

  /**
   * nptnhan (5/6/2026) hàm show toast
   */
  const showToast = (message, duration = 3000) => {
    toastMessage.value = message
    toastActive.value = true

    if (toastTimeout) {
      window.clearTimeout(toastTimeout)
    }

    toastTimeout = window.setTimeout(() => {
      toastActive.value = false
      toastTimeout = null
    }, duration)
  }

  return {
    toastActive,
    toastMessage,
    showToast,
  }
}
