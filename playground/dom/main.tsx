import react from 'react'
import reactDom from 'react-dom'

console.log(react)
console.log(reactDom)
console.log('Hello, world!')

const x = <div>111</div>
console.log(x)

const root = document.getElementById('root')

if(root){
  reactDom.createRoot(root).render(x)
}
