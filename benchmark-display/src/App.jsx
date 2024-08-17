import React from 'react'
import BenchmarkDisplay from './components/BenchmarkDisplay'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Micro-Benchmark</h1>
      </header>
      <main className="App-main">
        <BenchmarkDisplay />
      </main>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Polyhedra Network. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App