import { Props } from 'shared/ReactTypes'
import { Container } from './hostConfig'

export interface DOMElement extends Element {
  [elementPropsKey]: Props
}

type EventCallback = (e: Event) => void

interface SyntheticEvent extends Event {
  __stopPropagation: boolean
}

interface Paths {
  capture: EventCallback[]
  bubble: EventCallback[]
}


export const elementPropsKey = '__reactProps'
const validEventTypeList = ['click']



export function updateFiberProps(node: DOMElement, props: Props) {
  node[elementPropsKey] = props
}


export function initEvent(container: Container, eventType: string) {
  if (!validEventTypeList.includes(eventType)) {
    console.warn("为支持的事件类型", eventType)
    return
  }

  container.addEventListener(eventType, e => {
    dispatchEvent(container, eventType, e)
  })
}

function dispatchEvent(container: Container, eventType: string, event: Event) {
  const targetElement = event.target as DOMElement

  if (targetElement === null) {
    console.warn(`事件不存在target`, event)
  }
  const { capture, bubble } = collectPaths(targetElement, container, eventType)

  const se = createSyntheticEvent(event)

  triggerEventFlow(capture, se)

  if (!se.__stopPropagation) {
    triggerEventFlow(bubble, se)
  }

}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i]
    callback.call(null, se)
    if (se.__stopPropagation) {
      break
    }
  }
}


function createSyntheticEvent(e: Event) {
  const syntheticEvent = e as SyntheticEvent
  syntheticEvent.__stopPropagation = false

  const originStopPropagation = e.stopPropagation

  syntheticEvent.stopPropagation = () => {
    syntheticEvent.__stopPropagation = true
    if (originStopPropagation) {
      originStopPropagation()
    }
  }
  return syntheticEvent
}



function collectPaths(targetElement: DOMElement, container: Container, eventType: string) {
  const paths: Paths = {
    capture: [],
    bubble: []
  }

  while (targetElement && targetElement !== container) {
    const elementProps = targetElement[elementPropsKey]
    if (elementProps) {
      const callbackList = getEventCallbackNameFromEventType(eventType)
      if (callbackList) {
        callbackList.forEach((callbackName, i) => {
          const eventCallback = elementProps[callbackName]

          if (eventCallback) {
            if (i === 0) {
              paths.capture.unshift(eventCallback)
            } else {
              paths.bubble.unshift(eventCallback)
            }
          }
        })
      }
    }
    targetElement = targetElement.parentNode as DOMElement
  }
  return paths
}


function getEventCallbackNameFromEventType(eventType: string): string[] | undefined {
  const eventMap = {
    click: ['onClickCapture', 'onClick']
  }
  return eventMap[eventType]
}
