import { useState } from 'react'
import reactDom from 'react-dom'

function App() {
  const [count, setCount] = useState(100)
  window.setCount = setCount
  return (
    count === 3 ? <span>fuck</span> : <div>{count}</div>
  )
}

const root = document.getElementById('root')

if (root) {
  reactDom.createRoot(root).render(<App />)
}
