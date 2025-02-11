import react from 'react'
import reactDom from 'react-dom'

function App() {
  return <div>111</div>
}

const root = document.getElementById('root')

if (root) {
  reactDom.createRoot(root).render(<App />)
}
