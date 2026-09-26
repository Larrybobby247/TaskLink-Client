import { api } from './client.js';

/**
 * All calls here hit /api/admin/* routes, which are already protected on the
 * backend by requireAuth + requireAdmin (see server/src/routes/admin.routes.js).
 * This client does no authorization of its own - it just wraps the endpoints.
 */
export const adminApi = {
  // --- Dashboard ---
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),

  // --- Users ---
  searchUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getUser: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  verifyUser: (id) => api.post(`/admin/users/${id}/verify`).then((r) => r.data),
  suspendUser: (id, reason) => api.post(`/admin/users/${id}/suspend`, { reason }).then((r) => r.data),
  unsuspendUser: (id) => api.post(`/admin/users/${id}/unsuspend`).then((r) => r.data),
  deactivateUser: (id) => api.post(`/admin/users/${id}/deactivate`).then((r) => r.data),

  // --- Tasks ---
  searchTasks: (params) => api.get('/admin/tasks', { params }).then((r) => r.data),
  flagTask: (id, reason) => api.post(`/admin/tasks/${id}/flag`, { reason }).then((r) => r.data),
  pauseTask: (id) => api.post(`/admin/tasks/${id}/pause`).then((r) => r.data),
  deleteTask: (id) => api.delete(`/admin/tasks/${id}`).then((r) => r.data),

  // --- Payments / Transactions ---
  listPayments: (params) => api.get('/admin/payments', { params }).then((r) => r.data),

  // --- Withdrawals ---
  listWithdrawals: (params) => api.get('/admin/withdrawals', { params }).then((r) => r.data),
  approveWithdrawal: (id, paystackTransferCode) =>
    api.post(`/admin/withdrawals/${id}/approve`, { paystackTransferCode }).then((r) => r.data),
  rejectWithdrawal: (id, reason) => api.post(`/admin/withdrawals/${id}/reject`, { reason }).then((r) => r.data),

  // --- Balance adjustments (explicit, audited ledger entries only - never a raw balance edit) ---
  createBalanceAdjustment: (payload) => api.post('/admin/balance-adjustments', payload).then((r) => r.data),

  // --- Disputes ---
  listDisputes: (params) => api.get('/admin/disputes', { params }).then((r) => r.data),
  getDispute: (id) => api.get(`/admin/disputes/${id}`).then((r) => r.data),
  addDisputeNote: (id, note) => api.post(`/admin/disputes/${id}/notes`, { note }).then((r) => r.data),
  resolveDispute: (id, payload) => api.post(`/admin/disputes/${id}/resolve`, payload).then((r) => r.data),

  // --- Reports ---
  listReports: (params) => api.get('/admin/reports', { params }).then((r) => r.data),
  actionReport: (id, payload) => api.post(`/admin/reports/${id}/action`, payload).then((r) => r.data),

  // --- Platform settings ---
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (payload) => api.patch('/admin/settings', payload).then((r) => r.data),

  // --- Action logs (audit trail) ---
  getActionLogs: (params) => api.get('/admin/action-logs', { params }).then((r) => r.data),
};
