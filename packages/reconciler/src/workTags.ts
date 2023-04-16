export type WorkTag =
  typeof FunctionComponent |
  typeof HostRoot |
  typeof HostComponent |
  typeof HostText

export const FunctionComponent = 0 // 函数组件
export const ClassComponent = 1 // 类组件
export const IndeterminateComponent = 2 // 不确定的组件
export const HostRoot = 3 // 根节点
export const HostPortal = 4
export const HostComponent = 5 // 原生DOM元素组件
export const HostText = 6 // 纯文本组件
export const Fragment = 7 // Fragment组件
export const Mode = 8
export const ContextConsumer = 9
export const ContextProvider = 10
export const ForwardRef = 11
export const Profiler = 12
export const SuspenseComponent = 13
