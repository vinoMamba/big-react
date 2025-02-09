import path from 'path'
import fs from 'fs'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import ts from 'rollup-plugin-typescript2'

export const pkgPath = path.resolve(__dirname, '../../packages')
export const distPath = path.resolve(__dirname, '../../dist/node_modules')

export function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`
  }
  return `${pkgPath}/${pkgName}`
}

export function getPackageJSON(pkgName) {
  const path = `${resolvePkgPath(pkgName)}/package.json`
  const str = fs.readFileSync(path, { encoding: 'utf-8' })
  return JSON.parse(str)
}

export function getBaseRollupPlugins({
  typescript = {},
  alias = {
    __DEV__: true,
    preventAssignment: true
  } } = {}) {
  return [
    replace(alias),
    commonjs(),
    ts(typescript)
  ]
}
