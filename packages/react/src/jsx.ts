import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import type { ElementType, Key, Props, ReactElementType, Ref, Type } from 'shared/ReactTypes'

const ReactElement = function (type: Type, key: Key, ref: Ref, props: Props): ReactElementType {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    _mark: 'Vino',
  }
  return element
}

export const jsx = function (type: ElementType, config: any, ...maybeChildren: any) {
  let key: Key = null
  let ref: Ref = null
  const props: Props = {}

  // 处理config
  for (const prop in config) {
    const val = config[prop]
    if (prop === 'key') {
      if (val !== undefined) {
        key = `${val}`
      }
      continue
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val
      }
      continue
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val
    }
  }

  const maybeChildrenLength = maybeChildren.length
  if (maybeChildren) {
    if (maybeChildrenLength === 1) {
      props.children = maybeChildren[0]
    }
    else {
      props.children = maybeChildren
    }
  }
  return ReactElement(type, key, ref, props)
}

export const jsxDEV = function (type: ElementType, config: any) {
  let key: Key = null
  let ref: Ref = null
  const props: Props = {}

  // 处理config
  for (const prop in config) {
    const val = config[prop]
    if (prop === 'key') {
      if (val !== undefined) {
        key = `${val}`
      }
      continue
    }
    if (prop === 'ref') {
      if (val !== undefined) {
        ref = val
      }
      continue
    }
    if ({}.hasOwnProperty.call(config, prop)) {
      props[prop] = val
    }
  }
  return ReactElement(type, key, ref, props)
}
