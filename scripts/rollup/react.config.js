import gPkgJSON from 'rollup-plugin-generate-package-json'
import { getBaseRollupPlugin, getPkgJSON, resolvePkgPath } from './utils'

const { name, module } = getPkgJSON('react')

const pkgPath = resolvePkgPath(name, false)

const distPath = resolvePkgPath(name, true)

export default [
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${distPath}/index.js`,
      name: 'index.js',
      // 兼容 CommonJS 和 ES Module
      format: 'umd',
    },
    plugins: [
      ...getBaseRollupPlugin({}),
      gPkgJSON({
        inputFolder: pkgPath,
        outputFolder: distPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: 'index.js',
        }),
      }),
    ],
  },
  {
    input: `${pkgPath}/src/jsx.ts`,
    output: [
      {
        file: `${distPath}/jsx-runtime.js`,
        name: 'jsx-runtime.js',
        format: 'umd',
      },
      {
        file: `${distPath}/jsx-dev-runtime.js`,
        name: 'jsx-dev-runtime.js',
        format: 'umd',
      },
    ],
    plugins: getBaseRollupPlugin({}),
  },
]
