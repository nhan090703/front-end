import api from '@/apis/config/APIConfig.js'

class DocumentCodeRuleAPI {
  static async getAll() {
    return api.get('/DocumentCodeRules/all')
  }

  static async update(entity) {
    return api.put('/DocumentCodeRules', entity)
  }
}

export default DocumentCodeRuleAPI
