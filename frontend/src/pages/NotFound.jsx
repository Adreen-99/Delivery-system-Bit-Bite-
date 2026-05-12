import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-orange-500/20 dark:text-orange-500/10 leading-none mb-4">404</div>
        <div className="text-6xl mb-6">🍕</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          This page doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
