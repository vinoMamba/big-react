import { beginWork } from "./beginWork";
import { commitMutationEffects } from "./commitWork";
import { completeWork } from "./completeWork";
import { createWorkInProgress, FiberNode, FiberRootNode } from "./fiber";
import { MutationMask, NoFlags } from "./fiberFlags";
import { HostRoot } from "./workTags";

let workInProgress: FiberNode | null = null

function prepareFreshStack(fiber: FiberRootNode) {
  workInProgress = createWorkInProgress(fiber.current, {})
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  //TODO: 调度功能
  const root = markUpdateFromFiberToRoot(fiber)
  renderRoot(root)

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
function renderRoot(root: FiberRootNode) {
  // 初始化
  prepareFreshStack(root)

  do {
    try {
      workLoop()
      break
    } catch (e) {
      if (__DEV__) {
        console.log('workLoop发生错误', e)
      }
      workInProgress = null
    }

  } while (true)

  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork


  // 提交
  commitRoot(root)
}

function commitRoot(root: FiberRootNode) {
  const finishedWork = root.finishedWork
  if (finishedWork === null) {
    return
  }

  if (__DEV__) {
    console.warn('commit阶段开始')
  }

  root.finishedWork = null

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
  console.log('performUnitOfWork', workInProgress)
  const next = beginWork(fiber)
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
