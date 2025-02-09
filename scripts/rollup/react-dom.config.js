import { resolvePkgPath, getPackageJSON, getBaseRollupPlugins } from './utils'
import alias from '@rollup/plugin-alias'
import genPkgJson from 'rollup-plugin-generate-package-json'

const { name, module } = getPackageJSON('react-dom')
const inputPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
  {
    input: `${inputPath}/${module}`,
    output: [
      {
        file: `${pkgDistPath}/index.js`,
        name: 'index.js',
        format: 'umd',
      },
      {
        file: `${pkgDistPath}/client.js`,
        name: 'client.js',
        format: 'umd',
      }
    ],
    plugins: [
      ...getBaseRollupPlugins(),
      alias({
        entries: {
          hostConfig: `${inputPath}/src/hostConfig.ts`,
        }
      }),
      genPkgJson({
        inputFolder: `${inputPath}`,
        outputFolder: `${pkgDistPath}`,
        baseContents: ({ name, description, version }) => {
          return {
            name,
            description,
            version,
            peerDependencies: {
              react: version
            },
            main: 'index.js'
          }
        }
      })]
  },
]
