import { ReactElementType } from "shared/ReactTypes";
import { createFiberFromElement, FiberNode } from "./fiber";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbol";
import { HostText } from "./workTags";
import { Placement } from "./fiberFlags";

function ChildReconciler(shouldTrackEffects: boolean) {


  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    const fiber = createFiberFromElement(element)
    fiber.return = returnFiber
    return fiber
  }

  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
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


  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElementType
  ) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild))
        default:
          if (__DEV__) {
            console.log('未实现的reconcile类型', newChild)
          }
          break
      }
    }
    // 多节点
    // 文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild))
    }

    if (__DEV__) {
      console.log('未实现的reconcile类型', newChild)
    }

    return null
  }
}


export const reconcileChildFibers = ChildReconciler(true)

export const mountChildFibers = ChildReconciler(false)
