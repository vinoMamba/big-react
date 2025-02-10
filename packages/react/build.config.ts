import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'index.ts',
      outDir: 'dist',
      name: 'index',
    },
    {
      input: 'index.ts',
      outDir: 'dist',
      name: 'jsx-runtime',
    },
    {
      input: 'index.ts',
      outDir: 'dist',
      name: 'jsx-dev-runtime',
    },
  ],
})
