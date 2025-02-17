import { Dispatch, Dispatcher } from "react/src/currentDispatcher";
import { FiberNode } from "./fiber";
import internals from "internals";
import { createUpdate, createUpdateQueue, enqueueUpdate, processUpdateQueue, UpdateQueue } from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";
import { Lane, NoLane, requestUpdateLane } from "./fiberLanes";

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
let currentHook: Hook | null = null
let renderLane: Lane = NoLane

const { currentDispatcher } = internals




export function renderWithHooks(wip: FiberNode, lane: Lane) {
  //当前正在渲染的fiber
  currentlyRenderingFiber = wip
  wip.memoizedState = null
  wip.updateQueue = null
  renderLane = lane

  const current = wip.alternate

  if (current !== null) {
    // update
    currentDispatcher.current = HooksDispatcherOnUpdate
  } else {
    // mount
    currentDispatcher.current = HooksDispatcherOnMount
  }


  const Component = wip.type
  const props = wip.pendingProps
  const children = Component(props)


  currentlyRenderingFiber = null
  workInProgressHook = null
  currentHook = null
  renderLane = NoLane

  return children
}


const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState
}

function updateState<State>(): [State, Dispatch<State>] {
  const hook = updateWorkInProgressHook()

  const queue = hook.updateQueue as UpdateQueue<State>
  const pending = queue.shared.pending
  queue.shared.pending = null

  if (pending !== null) {
    const { memoizedState } = processUpdateQueue(hook.memoizedState, pending, renderLane)
    hook.memoizedState = memoizedState
  }

  return [hook.memoizedState, queue.dispatch]
}


function mountState<State>(initialState: State | (() => State)): [State, Dispatch<State>] {
  const hook = mountWorkInProgressHook()
  let memoizedState

  if (initialState instanceof Function) {
    memoizedState = initialState()
  } else {
    memoizedState = initialState
  }

  const queue = createUpdateQueue<State>()
  hook.updateQueue = queue
  hook.memoizedState = memoizedState

  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)
  queue.dispatch = dispatch;
  return [memoizedState, dispatch]
}

function dispatchSetState<State>(fiber: FiberNode, updateQueue: UpdateQueue<State>, action: Action<State>) {

  const lane = requestUpdateLane()

  const update = createUpdate(action, lane)
  enqueueUpdate(updateQueue, update)

  scheduleUpdateOnFiber(fiber, lane)
}


function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null
  }

  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件中调用useState')
    } else {
      workInProgressHook = hook
      currentlyRenderingFiber.memoizedState = workInProgressHook
    }
  } else {
    workInProgressHook.next = hook
    workInProgressHook = hook
  }

  return workInProgressHook
}


function updateWorkInProgressHook(): Hook {
  let nextCurrentHook: Hook | null = null

  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate
    if (current !== null) {
      nextCurrentHook = current.memoizedState
    } else {
      nextCurrentHook = null
    }
  } else {
    nextCurrentHook = currentHook.next
  }

  if (nextCurrentHook === null) {
    // TODO: 这里的边界情况是什么？ 
    // 比如在if 里面使用 useState 
    throw new Error(`组件${currentlyRenderingFiber.type}中存在多个useState`)
  }

  currentHook = nextCurrentHook as Hook
  const newHook: Hook = {
    memoizedState: currentHook.memoizedState,
    updateQueue: currentHook.updateQueue,
    next: null
  }

  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件中调用useState')
    } else {
      workInProgressHook = newHook
      currentlyRenderingFiber.memoizedState = workInProgressHook
    }
  } else {
    workInProgressHook.next = newHook
    workInProgressHook = newHook
  }
  return workInProgressHook
}
