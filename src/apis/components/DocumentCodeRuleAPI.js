import api from '@/apis/config/APIConfig.js'

class DocumentCodeRuleAPI {
  static async getAll() {
    return api.get('/DocumentCodeRules/all')
  }

  static async getPaged(request) {
    return api.post('/DocumentCodeRules/paged', request)
  }

  static async update(entity) {
    return api.put('/DocumentCodeRules', entity)
  }
}

export default DocumentCodeRuleAPI
