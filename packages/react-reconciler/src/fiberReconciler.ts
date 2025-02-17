import { Container } from "hostConfig";
import { HostRoot } from "./workTags";
import { FiberNode, FiberRootNode } from "./fiber";
import { createUpdate, createUpdateQueue, enqueueUpdate, UpdateQueue } from "./updateQueue";
import { ReactElementType } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";
import { requestUpdateLane } from "./fiberLanes";

export const createContainer = (containerInfo: Container) => {
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  const root = new FiberRootNode(containerInfo, hostRootFiber)
  hostRootFiber.updateQueue = createUpdateQueue()
  return root
}


export const updateContainer = (element: ReactElementType | null, root: FiberRootNode) => {
  const lane = requestUpdateLane()
  const hostRootFiber = root.current
  const update = createUpdate<ReactElementType | null>(element,lane)
  enqueueUpdate(hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, update)

  scheduleUpdateOnFiber(hostRootFiber,lane)
  return element
}
