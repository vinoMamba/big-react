import { scheduleMicroTask } from "hostConfig";
import { beginWork } from "./beginWork";
import { commitMutationEffects } from "./commitWork";
import { completeWork } from "./completeWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { MutationMask, NoFlags } from "./fiberFlags";
import { getHighestPriorityLane, Lane, markRootFinished, mergeLanes, NoLane, SyncLane } from "./fiberLanes";
import { flushSyncCallbacks, scheduleSyncCallback } from "./syncTaskQueue";
import { HostRoot } from "./workTags";

let workInProgress: FiberNode | null = null
let workRootRenderLane: Lane = NoLane

function prepareFreshStack(fiber: FiberRootNode, lane: Lane) {
  workInProgress = createWorkInProgress(fiber.current, {})
  workRootRenderLane = lane
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
  //TODO: 调度功能
  const root = markUpdateFromFiberToRoot(fiber)
  markRootUpdated(root, lane)
  ensureRootIsScheduled(root)
}

function ensureRootIsScheduled(root: FiberRootNode) {
  const updateLane = getHighestPriorityLane(root.pendingLanes)

  if (updateLane === NoLane) {
    return
  }

  if (updateLane === SyncLane) {
    // 同步优先级，用微任务调度
    console.log('在微任务中', updateLane)

    //[performSyncWorkOnRoot, performSyncWorkOnRoot, performSyncWorkOnRoot]

    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane))
    scheduleMicroTask(flushSyncCallbacks)
  } else {
    // 其他，用宏任务调度
  }
}




function markRootUpdated(root: FiberRootNode, lane: Lane) {
  root.pendingLanes = mergeLanes(root.pendingLanes, lane)
}


//从当前节点找到根节点
function markUpdateFromFiberToRoot(fiber: FiberNode) {
  let node = fiber
  let parent = node.return

  while (parent !== null) {
    node = parent
    parent = node.return
  }
  if (node.tag === HostRoot) {
    return node.stateNode
  }

  return null
}

// 触发更新的API 调用 renderRoot
function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
  const nextLane = getHighestPriorityLane(root.pendingLanes)
  if (nextLane !== SyncLane) {
    ensureRootIsScheduled(root)
    return
  }
  // 初始化
  prepareFreshStack(root, lane)

  do {
    try {
      workLoop()
      break
    } catch (e) {
      if (__DEV__) {
        console.error('workLoop发生错误', e)
      }
      workInProgress = null
    }

  } while (true)

  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  root.finishedLane = lane
  root.pendingLanes = NoLane

  // 提交
  commitRoot(root)
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork
  if (finishedWork === null) {
    return
  }

  if (__DEV__) {
    console.log('commit阶段开始')
  }

  const lane = root.finishedLane

  if (lane === NoLane) {
    console.warn('lane 不应该为 NoLane')
  }

  root.finishedWork = null
  root.finishedLane = NoLane

  markRootFinished(root, lane)

  const subtreeHasEffects = (finishedWork.subtreeFlags & (MutationMask)) !== NoFlags
  const rootHasEffects = (finishedWork.flags & MutationMask) !== NoFlags

  if (subtreeHasEffects || rootHasEffects) {
    commitMutationEffects(finishedWork);
    root.current = finishedWork

  } else {
    root.current = finishedWork
  }


}


function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}


function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber, workRootRenderLane)
  fiber.memoizedProps = fiber.pendingProps

  if (next === null) {
    completeUnitOfWork(fiber)
  } else {
    workInProgress = next
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber

  do {
    completeWork(node)
    const sibling = node.sibling
    if (sibling !== null) {
      workInProgress = sibling
      return
    }
    node = node.return
    workInProgress = node
  } while (node !== null)
}
