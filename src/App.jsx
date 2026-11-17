import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Esked</h1>
          <span className="text-sm text-slate-500">Offline-first schedule wallpapers</span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-semibold">Welcome to Esked</h2>
        <p className="mt-2 text-slate-600">
          Convert your class schedule into a beautiful phone wallpaper. All data stays on your device.
        </p>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="mt-6 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Clicked {count} times
        </button>
      </section>
    </main>
  )
}

export default App