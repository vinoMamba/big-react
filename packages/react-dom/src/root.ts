import { createContainer, updateContainer } from 'reconciler/src/fiberReconciler'
import type { ReactElementType } from 'shared/ReactTypes'
import type { Container } from './hotsConfig'

export function createRoot(container: Container) {
  const root = createContainer(container)
  return {
    render(element: ReactElementType) {
      updateContainer(element, root)
    },
  }
}
