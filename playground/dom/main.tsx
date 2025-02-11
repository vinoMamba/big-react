import react from 'react'
import reactDom from 'react-dom'

const x = <div>111</div>

const root = document.getElementById('root')

if(root){
  reactDom.createRoot(root).render(x)
}
