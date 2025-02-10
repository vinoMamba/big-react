import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'index.ts',
      name: 'index',
    },
    {
      input: 'index.ts',
      name: 'client',
    },
  ],
})
