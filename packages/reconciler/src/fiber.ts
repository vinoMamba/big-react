import type { Key, Props, Ref } from 'shared/ReactTypes'
import type { Container } from 'hostConfig'
import type { WorkTag } from './workTags'
import type { Flags } from './fiberFlags'
import { NoFlags } from './fiberFlags'

export class FiberNode {
  type: any
  tag: WorkTag
  pendingProps: Props
  key: Key
  stateNode: any
  ref: Ref | null

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  memoizedProps: Props | null
  alternate: FiberNode | null
  flags: Flags
  updateQueue: unknown

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag
    this.key = key
    this.stateNode = null
    this.type = null

    this.return = null
    this.sibling = null
    this.child = null
    this.index = 0

    this.ref = null

    this.pendingProps = pendingProps
    this.memoizedProps = null
    this.alternate = null
    this.updateQueue = null
    // 副作用
    this.flags = NoFlags
  }
}

export class FiberRootNode {
  container: Container
  current: FiberNode
  finishedWork: FiberNode | null
  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container
    this.current = hostRootFiber
    hostRootFiber.stateNode = this
    this.finishedWork = null
  }
}
