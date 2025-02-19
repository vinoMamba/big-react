import { Key, Props, ReactElementType } from "shared/ReactTypes";
import { createFiberFromElement, createFiberFromFragment, createWorkInProgress, FiberNode } from "./fiber";
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbol";
import { Fragment, HostText } from "./workTags";
import { ChildDeletion, Placement } from "./fiberFlags";

type ExistingChildren = Map<string | number, FiberNode>

function ChildReconciler(shouldTrackEffects: boolean) {

  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
    if (!shouldTrackEffects) {
      return
    }
    const deletions = returnFiber.deletions
    if (deletions === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    } else {
      deletions.push(childToDelete)
    }
  }
  function deleteRemainingChildren(returnFiber: FiberNode, currentFirstChild: FiberNode | null) {
    if (!shouldTrackEffects) {
      return
    }
    let childToDelete = currentFirstChild
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
  }


  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    const key = element.key
    while (currentFiber !== null) {
      //update
      if (currentFiber.key === key) {

        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            let props = element.props
            if (element.type === REACT_FRAGMENT_TYPE) {
              props = element.props.children
            }


            const existing = useFiber(currentFiber, element.props)
            existing.return = returnFiber
            deleteRemainingChildren(returnFiber, currentFiber.sibling)
            return existing
          }
          deleteRemainingChildren(returnFiber, currentFiber)
          break
        } else {
          if (__DEV__) {
            console.warn('未实现的react类型', element)
            break
          }
        }
      } else {
        //delete
        deleteChild(returnFiber, currentFiber)
        currentFiber = currentFiber.sibling
      }
    }


    let fiber

    if (element.type === REACT_FRAGMENT_TYPE) {
      fiber = createFiberFromFragment(element.props.children, element.key)
    } else {
      fiber = createFiberFromElement(element)
    }


    fiber.return = returnFiber
    return fiber
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {

    while (currentFiber !== null) {
      if (currentFiber.tag === HostText) {
        const existing = useFiber(currentFiber, { content })
        existing.return = returnFiber
        deleteRemainingChildren(returnFiber, currentFiber.sibling)
        return existing
      }
      deleteChild(returnFiber, currentFiber)
      currentFiber = currentFiber.sibling
    }

    const fiber = new FiberNode(HostText, { content }, null)
    fiber.return = returnFiber
    return fiber
  }

  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffects && fiber.alternate === null) {
      fiber.flags = Placement
    }
    return fiber
  }


  function reconcileChildrenArray(returnFiber: FiberNode, currentFirstChild: FiberNode | null, newChild: any) {
    let lastPlacedIndex = 0
    let lastNewFiber: FiberNode | null = null
    let firstNewFiber: FiberNode | null = null


    const existingChildren: ExistingChildren = new Map()
    let current = currentFirstChild
    while (current !== null) {
      const keyToUse = current.key !== null ? current.key : current.index
      existingChildren.set(keyToUse, current)
      current = current.sibling
    }
    for (let i = 0; i < newChild.length; i++) {
      const after = newChild[i]

      const newFiber = updateFromMap(returnFiber, existingChildren, i, after)

      if (newFiber === null) {
        continue
      }

      newFiber.index = i
      newFiber.return = returnFiber

      if (lastNewFiber === null) {
        lastNewFiber = newFiber
        firstNewFiber = newFiber
      } else {
        lastNewFiber.sibling = newFiber
        lastNewFiber = newFiber
      }

      if (!shouldTrackEffects) {
        continue
      }

      const current = newFiber.alternate
      if (current !== null) {
        const oldIndex = current.index
        if (oldIndex < lastPlacedIndex) {
          newFiber.flags |= Placement
          continue
        } else {
          lastPlacedIndex = oldIndex
        }
      } else {
        newFiber.flags |= Placement
      }
    }

    existingChildren.forEach((fiber) => {
      deleteChild(returnFiber, fiber)
    })

    return firstNewFiber
  }

  function updateFromMap(
    returnFiber: FiberNode,
    existingChildren: ExistingChildren,
    index: number,
    element: any
  ): FiberNode | null {
    const keyToUse = element.key !== null ? element.key : index
    const before = existingChildren.get(keyToUse)

    if (typeof element === 'string' || typeof element === 'number') {
      if (before) {
        if (before.tag === HostText) {
          existingChildren.delete(keyToUse)
          return useFiber(before, { content: element })
        }
      }
      return new FiberNode(HostText, { content: element + '' }, null)
    }

    if (typeof element === 'object' && element !== null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (element.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              before,
              element.props.children,
              element.key,
              existingChildren
            )
          }
          if (before) {
            if (before.type === element.type) {
              existingChildren.delete(keyToUse)
              return useFiber(before, element.props)
            }
          }
          return createFiberFromElement(element)
      }
      if (Array.isArray(element)) {
				console.warn('还未实现数组类型的child');
      }
    }


    if (Array.isArray(element)) {
      return updateFragment(
        returnFiber,
        before,
        element,
        keyToUse,
        existingChildren
      )
    }

    return null
  }


  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: any
  ) {

    const isUnkeyedTopLevelFragment = typeof newChild === 'object'
      && newChild !== null
      && newChild.type === REACT_FRAGMENT_TYPE
      && newChild.key === null

    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children
    }




    if (typeof newChild === 'object' && newChild !== null) {
      // 多节点
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFiber, newChild)
      }
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild))
        default:
          if (__DEV__) {
            console.warn('未实现的reconcile类型', newChild)
          }
          break
      }
    }
    // 文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild))
    }

    if (currentFiber !== null) {
      deleteRemainingChildren(returnFiber, currentFiber)
    }

    //兜底
    if (__DEV__) {
      console.warn('未实现的reconcile类型', newChild)
    }

    return null
  }
}

function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
  const clone = createWorkInProgress(fiber, pendingProps)
  clone.index = 0
  clone.sibling = null
  return clone
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)


function updateFragment(
  returnFiber: FiberNode,
  current: FiberNode | null,
  elements: any[],
  key: Key,
  existingChildren: ExistingChildren
) {
  let fiber
  if (!current || current.tag !== Fragment) {
    fiber = createFiberFromFragment(elements, key)
  } else {
    existingChildren.delete(key)
    fiber = useFiber(current, elements)
  }

  fiber.return = returnFiber
  return fiber
}
