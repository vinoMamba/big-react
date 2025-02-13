import { useState } from 'react'
import reactDom from 'react-dom'

function App() {
  const [count, setCount] = useState(100)

  const onClick = () => {
    setCount((n) => n + 1)
  }
  return (
    <div onClick={onClick}>{count}</div>
  )
}

const root = document.getElementById('root')

if (root) {
  reactDom.createRoot(root).render(<App />)
}
