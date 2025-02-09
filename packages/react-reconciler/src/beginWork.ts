// 递归中的递阶段

import { mountChildFibers } from "./childFibers"
import { reconcileChildFibers } from "./childFibers"
import { FiberNode } from "./fiber"
import { processUpdateQueue, UpdateQueue } from "./updateQueue"
import { HostComponent, HostRoot, HostText } from "./workTags"

export const beginWork = (wip: FiberNode) => {
  // 比较，返回子fiberNode
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip)
    case HostComponent:
      return updateHostComponent(wip)
    case HostText:
      return null
    default:
      if (__DEV__) {
        console.log('beginWork未实现的类型', wip.tag)
      }
      return null
  }
}


function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memoizedState
  const updateQueue = wip.updateQueue as UpdateQueue<Element>
  const pending = updateQueue.shared.pending
  updateQueue.shared.pending = null

  const { memoizedState } = processUpdateQueue(baseState, pending)
  wip.memoizedState = memoizedState

  const nextChildren = wip.memoizedState

  reconcileChildren(wip, nextChildren)
  return wip.child
}

function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps
  const nextChildren = nextProps.children
  reconcileChildren(wip, nextChildren)
  return wip.child
}

function reconcileChildren(wip: FiberNode, children: any) {
  const current = wip.alternate

  if (current !== null) {
    //update
    wip.child = reconcileChildFibers(wip, current?.child, children)
  } else {
    //mount
    wip.child = mountChildFibers(wip, null, children)
  }
}
