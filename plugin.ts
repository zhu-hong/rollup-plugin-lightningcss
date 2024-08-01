import type { Plugin } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import type { CreateFilter } from '@rollup/pluginutils'
import { Features, bundle as lightningcssTransform } from 'lightningcss'
import type { BundleOptions, CustomAtRules } from 'lightningcss'

interface ILightningcssPluginOption {
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
    include,
    exclude,
    lightningcssOptions,
    injectOptions,
  } = option

  const filter = createFilter(
    include??['**/*.css'],
    exclude,
  )

  const injectStyleFuncName = '_styleInject'

  return {
    name: 'lightningcss-plugin',
    intro() {
      return `import { styleInject as ${injectStyleFuncName} } from '@zhuh/style-inject'`
    },
    transform(code, id) {
      if(!filter(id) || code.trim() === '') return

      console.debug('\x1b[1;38;2;255;203;78m%s\x1b[0m',`⚡ [lightningcss] Processing ${id}...`)

      const result = lightningcssTransform({
        minify: true,
        filename: id,
        include: Features.Nesting,
        ...lightningcssOptions,
      })

      if(result.code.toString().trim() === '') return

      if(result.warnings.length > 0) {
        result.warnings.forEach((w) => console.debug('\x1b[1;38;2;255;203;78m%s\x1b[0m',`⚡ [lightningcss] Warning ${w.message} ${w.type}-${w.value} at ${w.loc}`))
      }
      
      return {
        code: `${injectStyleFuncName}(\`${result.code.toString()}\`, ${(injectOptions?.target||injectOptions?.tag)?`{
  ${(injectOptions?.target??false)?`target: ${injectOptions?.target},`:''}${(injectOptions?.tag??false)?`${(injectOptions?.target??false)?'\n\t':''}tag: '${injectOptions?.tag}',`:''}
}`:''})`,
        map: null,
      }
    },
  }
}
