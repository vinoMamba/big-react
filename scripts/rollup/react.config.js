import path from 'path'
import fs from 'fs'
import ts from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import genPkgJson from 'rollup-plugin-generate-package-json'


const pkgPath = path.resolve(__dirname, '../../packages')
const distPath = path.resolve(__dirname, '../../dist/node_modules')

function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`
  }
  return `${pkgPath}/${pkgName}`
}

function getPackageJSON(pkgName) {
  const path = `${resolvePkgPath(pkgName)}/package.json`
  const str = fs.readFileSync(path, { encoding: 'utf-8' })
  return JSON.parse(str)
}

function getBaseRollupPlugins({ typescript = {} } = {}) {
  return [
    commonjs(),
    ts(typescript)
  ]
}


const { name, module } = getPackageJSON('react')
const inputPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
  //react
  {
    input: `${inputPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'index.js',
      format: 'umd',
    },
    plugins: [...getBaseRollupPlugins(), genPkgJson({
      inputFolder: `${inputPath}`,
      outputFolder: `${pkgDistPath}`,
      baseContents: ({ name, description, version }) => {
        return {
          name,
          description,
          version,
          main: 'index.js'
        }
      }
    })]
  },
  //react-runtime
  {
    input: `${inputPath}/src/jsx.ts`,
    output: [
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: 'jsx-runtime.js',
        format: 'umd',
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'jsx-dev-runtime.js',
        format: 'umd',
      }
    ],
    plugins: getBaseRollupPlugins()
  }
]
