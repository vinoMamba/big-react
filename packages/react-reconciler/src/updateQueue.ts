import { Action } from "shared/ReactTypes";
import { Dispatch } from "react/src/currentDispatcher";
import { Lane } from "./fiberLanes";

export interface Update<State> {
  action: Action<State>  //Action ==> State | ((prevState: State) => State)
  next: Update<State> | null
  lane: Lane
}

export const createUpdate = <State>(action: Action<State>, line: Lane): Update<State> => {
  return {
    action,
    next: null,
    lane: line
  }
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null
  }
  dispatch: Dispatch<State> | null
}

export const createUpdateQueue = <State>() => {
  return {
    shared: {
      pending: null
    },
    dispatch: null
  } as UpdateQueue<State>
}

export const enqueueUpdate = <State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>
) => {
  // 形成环状链表，新插入的为pending 的第一个节点
  const pending = updateQueue.shared.pending
  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }

  updateQueue.shared.pending = update
}


export const processUpdateQueue = <State>(
  baseState: State,
  pendingUpdate: Update<State> | null,
  renderLane: Lane
): { memoizedState: State } => {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState
  }

  if (pendingUpdate !== null) {
    let first = pendingUpdate.next
    let pending = pendingUpdate.next

    do {
      const updateLane = pending.lane
      if (updateLane === renderLane) {
        const action = pendingUpdate.action
        if (action instanceof Function) {
          baseState = action(baseState)
        } else {
          baseState = action
        }
      } else {
        console.warn('不应该出现这种情况')
      }
      pending = pending.next
    } while (first !== pending)
  }

  result.memoizedState = baseState
  return result
}
