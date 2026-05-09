export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  )
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 animate-pulse">
      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
      <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
    </div>
  )
}

export function CartSidebarSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse space-y-4">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-800" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 animate-pulse flex">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 p-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  )
}
