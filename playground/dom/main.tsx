import { useState } from 'react'
import reactDom from 'react-dom'

function App() {
  const [count, setCount] = useState(100)

  const arr = count % 2 === 0 ? [
    <li key='1'>1</li>,
    <li key='2'>2</li>,
    <li key='3'>3</li>,
  ] : [
    <li key='3'>3</li>,
    <li key='2'>2</li>,
    <li key='1'>1</li>,
  ]

  return (
    <ul onClick={() => setCount(n => n + 1)}>
      <li key='4'>4</li>
      {arr}
    </ul>
  )
}

const root = document.getElementById('root')

if (root) {
  reactDom.createRoot(root).render(<App />)
}
