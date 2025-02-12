export type WorkTag =
  | typeof FunctionComponent
  | typeof HostRoot
  | typeof HostComponent
  | typeof HostText

export const FunctionComponent = 0 // 函数组件 <App />
export const HostRoot = 3 // 根节点 <div id="root"></div>
export const HostComponent = 5 // 原生组件 <div></div>
export const HostText = 6 // 文本节点 <span>123</span>
