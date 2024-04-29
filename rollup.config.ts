import { defineConfig } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

export default [
  defineConfig({
    input: './plugin.ts',
    external: ['@rollup/pluginutils', 'lightningcss'],
    plugins: [
      commonjs(),
      nodeResolve(),
      typescript(),
    ],
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: false,
    },
  }),
  defineConfig({
    input: './plugin.ts',
    plugins: [
      dts(),
    ],
    output: {
      dir: 'dist',
    },
  }),
]
