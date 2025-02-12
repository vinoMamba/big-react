import { useState } from 'react'
import reactDom from 'react-dom'

function App() {
  const [count, setCount] = useState(100)
  return <div>{count}</div>
}

const root = document.getElementById('root')

if (root) {
  reactDom.createRoot(root).render(<App />)
}
