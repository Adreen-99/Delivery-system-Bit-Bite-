export const API_URL = import.meta.env.VITE_API_URL || 'https://delivery-system-bit-bite-10.onrender.com/api'

export function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('bitbite-token')
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}
