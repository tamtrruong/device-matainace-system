import axios from 'axios'
import { http, unwrap } from './http'

export const authApi = {
  login: async (payload) => unwrap(await http.post('/auth/login', payload)),
}

export const usersApi = {
  me: async () => unwrap(await http.get('/users/me')),
  updateMe: async (payload) => unwrap(await http.put('/users/me', payload)),
  changePassword: async (payload) => unwrap(await http.post('/users/me/change-password', payload)),
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(await http.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }))
  },
  getAll: async () => unwrap(await http.get('/users')),
  getById: async (id) => unwrap(await http.get(`/users/${id}`)),
  getTechnicians: async () => unwrap(await http.get('/users/technicians')),
  create: async (payload) => unwrap(await http.post('/users/admin/create', payload)),
  toggleStatus: async (id) => unwrap(await http.patch(`/users/${id}/toggle-status`)),
  remove: async (id) => unwrap(await http.delete(`/users/${id}`)),
}

export const dashboardApi = {
  getAdminStats: async () => unwrap(await http.get('/dashboard')),
  getTechStats: async () => unwrap(await http.get('/dashboard/technician')),
}

export const devicesApi = {
  getAll: async (params = {}) => unwrap(await http.get('/devices', { params })),
  getById: async (id) => unwrap(await http.get(`/devices/${id}`)),
  getActive: async () => unwrap(await http.get('/devices/active')),
  create: async (payload) => unwrap(await http.post('/devices', payload)),
  update: async (id, payload) => unwrap(await http.put(`/devices/${id}`, payload)),
  updateStatus: async (id, status) => unwrap(await http.patch(`/devices/${id}/status`, null, { params: { status } })),
  uploadImage: async (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(await http.post(`/devices/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }))
  },
  remove: async (id) => unwrap(await http.delete(`/devices/${id}`)),
}

export const schedulesApi = {
  getAll: async (params = {}) => unwrap(await http.get('/maintenance-schedules', { params })),
  getById: async (id) => unwrap(await http.get(`/maintenance-schedules/${id}`)),
  getUpcoming: async (days = 7) => unwrap(await http.get('/maintenance-schedules/upcoming', { params: { days } })),
  getOverdue: async () => unwrap(await http.get('/maintenance-schedules/overdue')),
  create: async (payload) => unwrap(await http.post('/maintenance-schedules', payload)),
  update: async (id, payload) => unwrap(await http.put(`/maintenance-schedules/${id}`, payload)),
  complete: async (id, params = {}) => unwrap(await http.patch(`/maintenance-schedules/${id}/complete`, null, { params })),
  remove: async (id) => unwrap(await http.delete(`/maintenance-schedules/${id}`)),
}

export const incidentsApi = {
  getAll: async (params = {}) => unwrap(await http.get('/incidents', { params })),
  getById: async (id) => unwrap(await http.get(`/incidents/${id}`)),
  create: async (payload) => unwrap(await http.post('/incidents', payload)),
  update: async (id, payload) => unwrap(await http.put(`/incidents/${id}`, payload)),
  assign: async (id, technicianId) => unwrap(await http.patch(`/incidents/${id}/assign`, null, { params: { technicianId } })),
  resolve: async (id, resolutionNote) => unwrap(await http.patch(`/incidents/${id}/resolve`, null, { params: { resolutionNote } })),
  uploadImage: async (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(await http.post(`/incidents/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }))
  },
  remove: async (id) => unwrap(await http.delete(`/incidents/${id}`)),
}

export const forumApi = {
  getPosts: async (params = {}) => unwrap(await http.get('/forum/posts', { params })),
  getPostById: async (id) => unwrap(await http.get(`/forum/posts/${id}`)),
  createPost: async (payload) => unwrap(await http.post('/forum/posts', payload)),
  updatePost: async (id, payload) => unwrap(await http.put(`/forum/posts/${id}`, payload)),
  deletePost: async (id) => unwrap(await http.delete(`/forum/posts/${id}`)),
  getComments: async (postId) => unwrap(await http.get(`/forum/posts/${postId}/comments`)),
  createComment: async (postId, payload) => unwrap(await http.post(`/forum/posts/${postId}/comments`, payload)),
  updateComment: async (id, payload) => unwrap(await http.put(`/forum/comments/${id}`, payload)),
  deleteComment: async (id) => unwrap(await http.delete(`/forum/comments/${id}`)),
}

export const reportsApi = {
  downloadCostExcel: async () => {
    const token = localStorage.getItem('access_token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
    const response = await axios.get(`${baseURL}/reports/costs/excel`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    return response.data
  },
}
