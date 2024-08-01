import { defineConfig } from 'rollup'
import { lightningcssPlugin } from './plugin'

export default defineConfig({
  plugins: [
    lightningcssPlugin({
      injectOptions: {
        tag: 'lightningcss',
      },
    }),
  ],
  input: './test/test.js',
  output: {
    format: 'esm',
    dir: 'test_dist',
  },
})
