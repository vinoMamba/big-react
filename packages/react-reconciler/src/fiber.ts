import { Props, Key, Ref, ReactElementType } from "shared/ReactTypes"
import { Fragment, FunctionComponent, HostComponent, WorkTag } from "./workTags"
import { Flags, NoFlags } from "./fiberFlags"
import { Container } from "hostConfig"

export class FiberNode {
  type: any
  tag: WorkTag
  pendingProps: Props //新的待处理的props
  key: Key
  stateNode: any //指向真实DOM节点或者类组件实例
  ref: Ref | null

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  memoizedProps: Props | null //上一次渲染时的props
  memoizedState: any          //上一次渲染时的state
  alternate: FiberNode | null
  flags: Flags
  subtreeFlags: Flags
  updateQueue: unknown
  deletions: FiberNode[] | null

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.tag = tag
    this.key = key || null
    this.stateNode = null
    this.type = null

    this.return = null
    this.sibling = null
    this.child = null
    this.index = 0

    this.ref = null

    this.pendingProps = pendingProps
    this.memoizedProps = null
    this.memoizedState = null
    this.updateQueue = null

    this.alternate = null

    //effect
    this.flags = NoFlags
    this.subtreeFlags = NoFlags
    this.deletions = null
  }
}


export class FiberRootNode {
  container: Container
  current: FiberNode
  finishedWork: FiberNode | null // 更新完成后的fiber

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container
    this.current = hostRootFiber

    hostRootFiber.stateNode = this
    this.finishedWork = null
  }
}


export const createWorkInProgress = (current: FiberNode, pendingProps: Props): FiberNode => {
  let wip = current.alternate

  if (wip === null) {
    //mount
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.stateNode = current.stateNode

    wip.alternate = current
    current.alternate = wip
  } else {
    //update
    wip.pendingProps = pendingProps
    wip.flags = NoFlags
    wip.subtreeFlags = NoFlags
    wip.deletions = null
  }

  wip.type = current.type;
  wip.updateQueue = current.updateQueue;
  wip.child = current.child;
  wip.memoizedProps = current.memoizedProps;
  wip.memoizedState = current.memoizedState;
  return wip;
}


export const createFiberFromElement = (element: ReactElementType) => {
  const { type, key, props } = element

  let fiberTag: WorkTag = FunctionComponent

  if (typeof type === 'string') {
    fiberTag = HostComponent
  } else if (typeof type === 'function' && __DEV__) {
    fiberTag = FunctionComponent
  }

  const fiber = new FiberNode(fiberTag, props, key)
  fiber.type = type

  return fiber
}


export const createFiberFromFragment = (elements: any[], key: Key) => {
  const fiber = new FiberNode(Fragment, elements, key)
  return fiber
}
