import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'index.ts',
      outDir: 'dist',
      name: 'index',
    },
    {
      input: 'src/jsx.ts',
      outDir: 'dist',
      name: 'jsx-runtime',
    },
    {
      input: 'src/jsx.ts',
      outDir: 'dist',
      name: 'jsx-dev-runtime',
    },
  ],
  declaration: true,
  clean: true,
})
