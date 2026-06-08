import api from '@/apis/config/APIConfig.js'

class ChangeLogAPI {
  static async getPaged(request) {
    return api.post('/ChangeLogs/paged', request)
  }
}

export default ChangeLogAPI
