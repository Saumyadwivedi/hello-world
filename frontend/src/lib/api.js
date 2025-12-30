import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const createSession = (sessionId) => api.post('/auth/session', { session_id: sessionId });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Societies
export const createSociety = (data) => api.post('/societies', data);
export const getSocieties = () => api.get('/societies');
export const getSociety = (id) => api.get(`/societies/${id}`);
export const approveSociety = (id, status) => api.patch(`/societies/${id}/approve?status=${status}`);
export const joinSociety = (id, role) => api.post(`/societies/${id}/join?role=${role}`);

// Sellers
export const registerSeller = (formData) => api.post('/sellers', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getSellers = () => api.get('/sellers');
export const getSeller = (id) => api.get(`/sellers/${id}`);
export const approveSeller = (id, status) => api.patch(`/sellers/${id}/approve?status=${status}`);

// Food Items
export const createFoodItem = (data) => api.post('/food-items', data);
export const getFoodItems = (params) => api.get('/food-items', { params });
export const getFoodItem = (id) => api.get(`/food-items/${id}`);
export const updateFoodItem = (id, data) => api.patch(`/food-items/${id}`, data);
export const deleteFoodItem = (id) => api.delete(`/food-items/${id}`);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status?status=${status}`);

// Payments
export const createCheckout = (orderId, hostUrl) => api.post('/payments/checkout', { order_id: orderId, host_url: hostUrl });
export const checkPaymentStatus = (sessionId) => api.get(`/payments/status/${sessionId}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');

export default api;