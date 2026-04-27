import React from 'react'
import UseEffects from './Components/UseEffects'
import EffectHook from './Components/EffectHook'
import ThemeToggle from './Components/ThemeToggle'

const App = () => {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-purple-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <ThemeToggle />
      <UseEffects />
      <hr className="border-slate-200 dark:border-slate-800" />
      <EffectHook />
    </div>
  )
}

export default App