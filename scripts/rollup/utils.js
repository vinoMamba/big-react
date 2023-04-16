import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import cjs from '@rollup/plugin-commonjs'
import ts from 'rollup-plugin-typescript2'

const pkgPath = resolve(__dirname, '../../packages')
const distPath = resolve(__dirname, '../../dist/node_modules')

export function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`
  }
  else {
    return `${pkgPath}/${pkgName}`
  }
}

export function getPkgJSON(pkgName) {
  const path = `${resolvePkgPath(pkgName, false)}/package.json`
  const str = readFileSync(path)
  return JSON.parse(str.toString())
}

export function getBaseRollupPlugin({
  typescript = {},
}) {
  return [
    cjs(),
    ts(typescript),
  ]
}
