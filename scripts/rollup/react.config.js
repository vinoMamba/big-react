import { resolvePkgPath, getPackageJSON, getBaseRollupPlugins } from './utils'
import genPkgJson from 'rollup-plugin-generate-package-json'


const { name, module } = getPackageJSON('react')
const inputPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
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
