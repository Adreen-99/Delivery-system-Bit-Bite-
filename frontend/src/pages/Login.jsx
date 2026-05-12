import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useUser()
  const { addToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const newErrors = { ...errors }
      if (name === 'email') {
        if (!value) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'Invalid email format'
        else delete newErrors.email
      }
      if (name === 'password') {
        if (!value) newErrors.password = 'Password is required'
        else delete newErrors.password
      }
      setErrors(newErrors)
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const errs = validate()
    if (errs[name]) setErrors(prev => ({ ...prev, [name]: errs[name] }))
    else setErrors(prev => {
      const next = { ...prev }; delete next[name]; return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    setTouched({ email: true, password: true })
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await login(form.email, form.password)
      addToast('Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      setErrors({ form: msg })
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex mb-4"><Logo size={44} /></Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange} onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                    errors.email && touched.email ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password" name="password" type="password"
                  value={form.password} onChange={handleChange} onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                    errors.password && touched.password ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                {errors.password && touched.password && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
                )}
              </div>

              {errors.form && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">{errors.form}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-700 dark:to-gray-900 items-center justify-center">
        <div className="text-white text-center px-8 max-w-md">
          <div className="text-8xl mb-6">⚡</div>
          <h2 className="text-4xl font-bold mb-4">Pay with Lightning</h2>
          <p className="text-xl opacity-90">Fast, cheap Bitcoin payments for your food</p>
        </div>
      </div>
    </div>
  )
}
