import type { Container } from 'hostConfig'
import type { ReactElementType } from 'shared/ReactTypes'
import { FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'
import type { UpdateQueue } from './updateQueue'
import { createUpdate, createUpdateQueue, enqueueUpdate } from './updateQueue'

export function createContainer(container: Container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  const root = new FiberRootNode(container, hostRootFiber)
  hostRootFiber.updateQueue = createUpdateQueue()
  return root
}

export function updateContainer(element: ReactElementType | null, root: FiberRootNode) {
  const hostRootFiber = root.current
  const update = createUpdate<ReactElementType | null>(element)
  enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update)
  return element
}
