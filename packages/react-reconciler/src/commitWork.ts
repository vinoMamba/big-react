import { appendChildToContainer, commitUpdate, Container, insertChildToContainer, Instance, removeChild } from "hostConfig";
import { FiberNode, FiberRootNode } from "./fiber";
import { ChildDeletion, NoFlags, Placement, Update } from "./fiberFlags";
import { FunctionComponent, HostRoot, HostText } from "./workTags";
import { MutationMask } from "./fiberFlags";
import { HostComponent } from "./workTags";

let nextEffect: FiberNode | null = null

export const commitMutationEffects = (finishedWork: FiberNode) => {
  nextEffect = finishedWork


  while (nextEffect !== null) {
    const child: FiberNode | null = nextEffect.child
    if ((nextEffect.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      nextEffect = child
    } else {
      up: while (nextEffect !== null) {
        commitMutationEffectsOnFiber(nextEffect)
        const sibling: FiberNode | null = nextEffect.sibling
        if (sibling !== null) {
          nextEffect = sibling
          break up
        }
        nextEffect = nextEffect.return
      }
    }
  }
}


function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
  const flags = finishedWork.flags

  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork)
    finishedWork.flags &= ~Placement
  }
  // flags Update
  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork)
    finishedWork.flags &= ~Update
  }
  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions
    if (deletions !== null) {
      deletions.forEach(child => {
        commitDeletion(child)
      })
    }
    finishedWork.flags &= ~ChildDeletion
  }
}

function recordHostChildrenToDelete(
  childToDelete: FiberNode[],
  unmountFiber: FiberNode
) {
  let lastOne = childToDelete[childToDelete.length - 1]
  if (!lastOne) {
    childToDelete.push(unmountFiber)
  } else {
    let node = lastOne.sibling
    while (node !== null) {
      if (unmountFiber === node) {
        childToDelete.push(unmountFiber)
      }
      node = node.sibling
    }
  }
}

function commitDeletion(childToDelete: FiberNode) {
  const rootChildrenToDelete: FiberNode[] = []

  commitNestedHostComponents(childToDelete, (unmountFiber) => {
    switch (unmountFiber.tag) {
      case HostComponent:
        recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber)
        return
      case HostText:
        recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber)
        return
      case FunctionComponent:
        // useEffect unMount
        return
      default:
        if (__DEV__) {
          console.warn('未处理的unmount类型', unmountFiber)
        }
    }
  })
  if (rootChildrenToDelete.length) {
    const hostParent = getHostParentNode(childToDelete)
    if (hostParent !== null) {
      rootChildrenToDelete.forEach(node => {
        removeChild(node.stateNode, hostParent)
      })
    }
  }
  childToDelete.return = null
  childToDelete.child = null
}

function commitNestedHostComponents(
  root: FiberNode,
  onCommitUnMount: (fiber: FiberNode) => void
) {
  let node = root
  while (true) {
    onCommitUnMount(node)

    if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === root) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === null) {
        return
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}


function commitPlacement(finishedWork: FiberNode) {
  // parent DOM
  if (__DEV__) {
    console.log('执行Placement操作')
  }
  const hostParent = getHostParentNode(finishedWork)

  const sibling = getHostSibling(finishedWork)

  if (hostParent !== null) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling)
  }
}

function getHostSibling(fiber: FiberNode) {
  let node: FiberNode = fiber

  findSibling: while (true) {
    while (node.sibling === null) {
      const parent = node.return
      if (parent === null || parent.tag === HostComponent || parent.tag === HostRoot) {
        return null
      }
      node = parent
    }



    node.sibling.return = node.return
    node = node.sibling

    while (node.tag !== HostComponent && node.tag !== HostText) {
      //向下遍历
      if ((node.flags & Placement) !== NoFlags) {
        continue findSibling
      }
      if (node.child === null) {
        continue findSibling
      } else {
        node.child.return = node
        node = node.child
      }

      if ((node.flags & Placement) === NoFlags) {
        return node.stateNode
      }
    }
  }
}


function getHostParentNode(fiber: FiberNode): Container | null {
  let parent = fiber.return
  while (parent) {
    const parentTag = parent.tag
    if (parentTag === HostComponent) {
      return parent.stateNode as Container
    }

    if (parentTag === HostRoot) {
      return (parent.stateNode as FiberRootNode).container
    }
    parent = parent.return
  }
  if (__DEV__) {
    console.warn('未找到HostParent')
  }
  return null
}


function insertOrAppendPlacementNodeIntoContainer(
  finishedWork: FiberNode,
  hostParent: Container,
  before?: Instance
) {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    if (before) {
      insertChildToContainer(finishedWork.stateNode, hostParent, before)
    } else {
      appendChildToContainer(hostParent, finishedWork.stateNode)
    }
    return
  }

  const child = finishedWork.child
  if (child !== null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParent)
    let sibling = child.sibling

    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParent)
      sibling = sibling.sibling
    }
  }
}

