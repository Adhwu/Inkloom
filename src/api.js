import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.detail || err.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

// --- Brands ---
export const getBrands = () => api.get('/api/brands').then(r => r.data)
export const getBrand = (id) => api.get(`/api/brands/${id}`).then(r => r.data)
export const createBrand = (data) => api.post('/api/brands', data).then(r => r.data)
export const updateBrand = (id, data) => api.put(`/api/brands/${id}`, data).then(r => r.data)
export const deleteBrand = (id) => api.delete(`/api/brands/${id}`).then(r => r.data)

// --- Audits ---
export const runAudit = (data) => api.post('/api/audit', data).then(r => r.data)
export const getAudit = (id) => api.get(`/api/audit/${id}`).then(r => r.data)
export const generateCorrection = (id) => api.post(`/api/audit/${id}/correct`).then(r => r.data)
export const updateAuditReview = (id, data) => api.put(`/api/audit/${id}/review`, data).then(r => r.data)
export const listAudits = (brandId, limit) => {
  const params = {}
  if (brandId) params.brand_id = brandId
  if (limit) params.limit = limit
  return api.get('/api/audits', { params }).then(r => r.data)
}

// --- Campaigns ---
export const createCampaign = (data) => api.post('/api/campaigns', data).then(r => r.data)
export const listCampaigns = (brandId) => {
  const params = brandId ? { brand_id: brandId } : {}
  return api.get('/api/campaigns', { params }).then(r => r.data)
}
export const updateCampaignReview = (id, data) => api.put(`/api/campaigns/${id}/review`, data).then(r => r.data)

// --- Analytics ---
export const getAnalytics = () => api.get('/api/analytics').then(r => r.data)
export const getStatus = () => api.get('/api/status').then(r => r.data)
