import { FiberRootNode } from "./fiber"

export type Lane = number
export type Lanes = number

// lane 越小且不等于0，优先级越高
export const SyncLane = 0b0001
export const NoLane = 0b0000
export const NoLanes = 0b0000

export function mergeLanes(laneA: Lane, laneB: Lane): Lanes {
  return laneA | laneB
}


export function requestUpdateLane(): Lanes {
  return SyncLane
}


export function getHighestPriorityLane(lanes: Lanes): Lane {
  return lanes & -lanes
}


export function markRootFinished(root: FiberRootNode, lane: Lane) {
  root.pendingLanes &= ~lane
}
