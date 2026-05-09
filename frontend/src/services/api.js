import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Restaurant endpoints
export const getRestaurants = () => api.get('/restaurants')
export const getRestaurant = (id) => api.get(`/restaurants/${id}`)
export const getMenu = (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`)

// User endpoints
export const createUser = (userData) => api.post('/users', userData)
export const getUser = (userId) => api.get(`/users/${userId}`)

// Auth endpoints
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// Order endpoints
export const createOrder = (orderData) => api.post('/orders', orderData)
export const getOrder = (orderId) => api.get(`/orders/${orderId}`)
export const getUserOrders = (userId) => api.get(`/orders/user/${userId}`)

// Payment endpoints
export const checkPayment = (paymentHash) => api.get(`/payments/check/${paymentHash}`)

// Delivery endpoints
export const getDeliveryStatus = (orderId) => api.get(`/delivery/${orderId}`)
export const updateDeliveryStatus = (orderId, data) => api.put(`/delivery/${orderId}`, data)
