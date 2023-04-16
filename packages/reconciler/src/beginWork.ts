import type { FiberNode } from './fiber'
import { HostComponent, HostRoot } from './workTags'

export function beginWork(wip: FiberNode) {
  switch (wip.tag) {
    case HostRoot:
      return
    case HostComponent:
      return
    default:
      if (__DEV__) {
        console.warn('beginWork')
      }
  }
}
