import type { Plugin } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import type { CreateFilter } from '@rollup/pluginutils'
import { bundle as lightningcssTransform } from 'lightningcss'
import type { BundleOptions, CustomAtRules } from 'lightningcss'
import { basename } from 'node:path'

interface ILightningcssPluginOption {
  inject?: boolean;
  include?: Parameters<CreateFilter>[0];
  exclude?: Parameters<CreateFilter>[1];
  lightningcssOptions?: BundleOptions<CustomAtRules>;
  injectOptions?: {
    target?: string;
    tag?: string;
  };
}

export const lightningcssPlugin= (option: ILightningcssPluginOption = {}): Plugin => {
  const {
    inject = true,
    include,
    exclude,
    lightningcssOptions,
    injectOptions,
  } = option

  const filter = createFilter(
    include??['**/*.css'],
    exclude,
  )

  const injectStyleFuncName = '$zh_styleInject'

  return {
    name: 'lightningcss-plugin',
    intro() {
      if(inject) {
        return `import { styleInject as ${injectStyleFuncName} } from '@zhuh/style-inject'`
      }
      return ''
    },
    transform(code, id) {
      if(!filter(id) || code.trim() === '') return

      console.debug('\x1b[1;38;2;255;203;78m%s\x1b[0m',`⚡ [lightningcss] Processing ${id}...`)

      const result = lightningcssTransform({
        minify: true,
        ...lightningcssOptions,
        filename: id,
      })

      if(result.code.toString().trim() === '') return

      if(result.warnings.length > 0) {
        result.warnings.forEach((w) => console.debug('\x1b[1;38;2;255;203;78m%s\x1b[0m',`⚡ [lightningcss] Warning ${w.message} at ${w.loc} ${w.type}-${w.value}...`))
      }

      if(inject) {
        return {
          code: `${injectStyleFuncName}(\`${result.code.toString()}\`, {
  target: ${injectOptions?.target},
  tag: '${injectOptions?.tag}',
})`,
          map: null,
        }
      }
      this.emitFile({
        type: 'asset',
        source: result.code,
        fileName: basename(id),
      })
      return ''
    },
  }
}
