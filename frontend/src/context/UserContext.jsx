import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getMe } from '../services/api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bitbite-token')
    if (token) {
      getMe()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('bitbite-token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    const { user, token } = res.data
    localStorage.setItem('bitbite-token', token)
    setUser(user)
    return user
  }

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password })
    const { user, token } = res.data
    localStorage.setItem('bitbite-token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bitbite-token')
  }

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
