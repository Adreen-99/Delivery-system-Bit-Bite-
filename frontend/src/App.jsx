import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import { PageSkeleton, FormSkeleton } from './components/Skeleton'
import Navbar from './components/Navbar'

const Home = lazy(() => import('./pages/Home'))
const Restaurant = lazy(() => import('./pages/Restaurant'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const NotFound = lazy(() => import('./pages/NotFound'))

function Layout({ children }) {
  return <div className="animate-fade-in">{children}</div>
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <Suspense fallback={<PageSkeleton />}>
                  <Routes>
                    <Route path="/" element={<Layout><Navbar /><Home /></Layout>} />
                    <Route path="/restaurant/:id" element={<Layout><Navbar /><Restaurant /></Layout>} />
                    <Route path="/cart" element={<Layout><Navbar /><Cart /></Layout>} />
                    <Route path="/checkout" element={<Suspense fallback={<FormSkeleton />}><Checkout /></Suspense>} />
                    <Route path="/order/:orderId" element={<Suspense fallback={<FormSkeleton />}><OrderConfirmation /></Suspense>} />
                    <Route path="/track/:orderId" element={<Suspense fallback={<FormSkeleton />}><TrackOrder /></Suspense>} />
                    <Route path="/login" element={<Suspense fallback={<FormSkeleton />}><Login /></Suspense>} />
                    <Route path="/signup" element={<Suspense fallback={<FormSkeleton />}><Signup /></Suspense>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </ToastProvider>
          </CartProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
