import { Dispatch, Dispatcher } from "react/src/currentDispatcher";
import { FiberNode } from "./fiber";
import internals from "shared/internals";
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null

const { currentDispatcher } = internals

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}



export function renderWithHooks(wip: FiberNode) {
  //当前正在渲染的fiber
  currentlyRenderingFiber = wip
  wip.memoizedState = null

  const current = wip.alternate

  if (current !== null) {
    // update
  } else {
    // mount
    currentDispatcher.current = HooksDispatcherOnMount
  }


  const Component = wip.type
  const props = wip.pendingProps
  const children = Component(props)


  currentlyRenderingFiber = null

  return children
}


const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
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

  return [memoizedState, dispatch]
}

function dispatchSetState<State>(fiber: FiberNode, updateQueue: UpdateQueue<State>, action: Action<State>) {
  const update = createUpdate(action)
  enqueueUpdate(updateQueue, update)

  scheduleUpdateOnFiber(fiber)
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
