import api from '@/apis/config/APIConfig.js'

class ShiftAPI {
  /**
   * nptnhan (5/6/2026) hàm get paged
   */
  static async getPaged(request) {
    return api.post('/shifts/paged', request)
  }

  /**
   * nptnhan (5/6/2026) hàm export excel
   */
  static async exportExcel(request) {
    return api.post('/shifts/export', request, {
      responseType: 'blob',
    })
  }

  /**
   * nptnhan (5/6/2026) hàm delete
   */
  static async delete(id) {
    return api.delete(`/shifts/${id}`)
  }

  /**
   * nptnhan (5/6/2026) hàm add
   */
  static async add(entity) {
    return api.post('/shifts', entity)
  }

  static async generateCode() {
    return api.get('/shifts/generate-code')
  }

  /**
   * nptnhan (5/6/2026) hàm update active
   */
  static async updateActive(ids, inActive) {
    return api.put('/shifts/active', {
      ids: ids,
      inActive: inActive
    })
  }

  /**
   * nptnhan (5/6/2026) hàm update
   */
  static async update(entity) {
    return api.put('/shifts', entity)
  }

  /**
   * nptnhan (5/6/2026) hàm delete many
   */
  static async deleteMany(ids) {
    return api.delete('/shifts/many', { data: ids })
  }
}

export default ShiftAPI
