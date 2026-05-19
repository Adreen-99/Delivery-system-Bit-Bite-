import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'
import Logo from '../components/Logo'

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useUser()
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'At least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      addToast('Account created successfully!', 'success')
      navigate('/')
    } catch (err) {
      const msg = err.message || 'Registration failed'
      setErrors({ form: msg })
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
      errors[field] && touched[field] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
    }`

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex transition-colors">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-700 dark:to-gray-900 items-center justify-center">
        <div className="text-white text-center px-8 max-w-md">
          <div className="text-8xl mb-6">🍕</div>
          <h2 className="text-4xl font-bold mb-4">Join Bit-Bite</h2>
          <p className="text-xl opacity-90">Order food and pay with Bitcoin Lightning</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex mb-4"><Logo size={44} /></Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Get started with Bit-Bite</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('name')} placeholder="John Doe" autoComplete="name" />
                {errors.name && touched.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input id="signup-email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('email')} placeholder="you@example.com" autoComplete="email" />
                {errors.email && touched.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input id="signup-password" name="password" type="password" value={form.password} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('password')} placeholder="At least 6 characters" autoComplete="new-password" />
                {errors.password && touched.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                  className={inputClass('confirmPassword')} placeholder="Repeat your password" autoComplete="new-password" />
                {errors.confirmPassword && touched.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>}
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
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
