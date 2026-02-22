import type { InlineConfig } from 'vite'
import type { ViteSSGOptions } from 'vite-ssg'
import type { ResolvedValaxyOptions, ValaxyNode } from './types'
import { join, resolve } from 'node:path'
import { consola } from 'consola'

import { colors } from 'consola/utils'
import fs from 'fs-extra'
import { mergeConfig as mergeViteConfig, build as viteBuild } from 'vite'
import generateSitemap from 'vite-ssg-sitemap'
import { build as viteSsgBuild } from 'vite-ssg/node'
import { defaultViteConfig } from './constants'
import { ViteValaxyPlugins } from './plugins/preset'
import { collectRedirects, writeRedirectFiles } from './utils/clientRedirects'

export async function build(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = defaultViteConfig,
) {
  const inlineConfig = mergeViteConfig(viteConfig, {
    ...defaultViteConfig,
    plugins: await ViteValaxyPlugins(valaxyApp),
  })

  await viteBuild(inlineConfig)
}

export async function ssgBuild(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
) {
  const { options } = valaxyApp
  const cdnModuleNames = (options.config.cdn?.modules || []).map(m => m.name)
  const defaultConfig: InlineConfig = {
    ...defaultViteConfig,
    plugins: await ViteValaxyPlugins(valaxyApp),
    ssr: {
      // TODO: workaround until they support native ESM
      noExternal: ['workbox-window', /vue-i18n/, '@vue/devtools-api', ...cdnModuleNames],
    },
  }

  const inlineConfig: InlineConfig = mergeViteConfig(defaultConfig, viteConfig)

  /**
   * User ssgOptions from `vite.config.ts` or `valaxy.config.ts > vite.ssgOptions`.
   *
   * `vite-ssg` internally merges via `Object.assign({}, config.ssgOptions, ssgOptions)`,
   * where the first argument (ssgOptions) takes priority over `config.ssgOptions`.
   *
   * We extract user ssgOptions from the resolved vite config, then:
   * 1. Shallow-merge with Valaxy defaults (user wins on top-level keys)
   * 2. Deep-merge `beastiesOptions` so user values extend (not replace) defaults
   * 3. Compose `onFinished` to always run Valaxy's sitemap + user callback
   *
   * The merged result is passed as the first argument to `viteSsgBuild`,
   * and `inlineConfig.ssgOptions` is deleted to prevent double-merging.
   *
   * @see https://github.com/antfu-collective/vite-ssg
   */
  const userSsgOptions: Partial<ViteSSGOptions> = inlineConfig.ssgOptions || {}

  // Remove ssgOptions from viteConfig to avoid double-merging inside vite-ssg
  delete inlineConfig.ssgOptions

  const valaxySsgDefaults: Partial<ViteSSGOptions> = {
    script: 'async',
    formatting: 'minify',
    beastiesOptions: {
      /**
       * Preload strategy for non-critical CSS.
       *
       * - `'media'`: Uses `<link rel="stylesheet" media="print" onload="this.media='all'">`.
       *   The link stays as `rel="stylesheet"` so browsers handle it predictably;
       *   JS-disabled users still get print styles as a fallback.
       * - `'swap'` (previous default): Converts links to `<link rel="preload" onload='this.rel="stylesheet"'>`.
       *   CSS relies entirely on JS `onload` callback, causing FOUC on slow networks.
       *
       * Other available strategies: `'body'`, `'swap-high'`, `'swap-low'`, `'js'`, `'js-lazy'`
       * @see https://github.com/danielroe/beasties#preload
       */
      preload: 'media',
      // reduceInlineStyles: false,
    },
    onFinished() {
      generateSitemap(
        {
          hostname: options.config.siteConfig.url,
        },
      )
    },

    // dirStyle default it flat
    // dirStyle: 'nested',
  }

  // User ssgOptions override Valaxy defaults
  // Users can customize beastiesOptions via `vite.ssgOptions.beastiesOptions`
  const mergedSsgOptions: Partial<ViteSSGOptions> = {
    ...valaxySsgDefaults,
    ...userSsgOptions,
  }

  // Deep-merge beastiesOptions so user values extend (not replace) Valaxy defaults
  if (userSsgOptions.beastiesOptions && valaxySsgDefaults.beastiesOptions) {
    mergedSsgOptions.beastiesOptions = {
      ...valaxySsgDefaults.beastiesOptions,
      ...userSsgOptions.beastiesOptions,
    }
  }

  // Compose onFinished: always run Valaxy's sitemap generation,
  // then call the user's onFinished if provided
  if (userSsgOptions.onFinished) {
    const valaxyOnFinished = valaxySsgDefaults.onFinished!
    const userOnFinished = userSsgOptions.onFinished
    mergedSsgOptions.onFinished = async () => {
      await valaxyOnFinished()
      await userOnFinished()
    }
  }

  // Generate static pages for pagination
  if (options.config.build.ssgForPagination) {
    mergedSsgOptions.includedRoutes = (paths, _routes) => {
      const newPaths = paths
      const posts = paths.filter(path => path.startsWith('/posts/'))
      const pageNumber = Math.ceil(posts.length / options.config.siteConfig.pageSize)

      consola.info(`Generate ${colors.yellow(pageNumber)} pages for pagination.`)
      for (let i = 1; i <= pageNumber; i++)
        newPaths.push(`/page/${i}`)

      if (!userSsgOptions.includeAllRoutes)
        return newPaths.filter(path => !path.split('/').some(p => p.startsWith(':')))
      else
        return newPaths
    }
  }

  await viteSsgBuild(mergedSsgOptions, inlineConfig)
}

/**
 * post process for ssg fix extra string like `/html>` `ml>` `l>`
 * handle tasks after ssg build
 * todo find why
 * @param options
 */
export async function postProcessForSSG(options: ResolvedValaxyOptions) {
  const { userRoot } = options
  const indexPath = resolve(userRoot, 'dist/index.html')
  if (fs.existsSync(indexPath)) {
    consola.info('post process for ssg...')

    const indexFile = await fs.readFile(indexPath, 'utf-8')
    // fix incomplete index.html (with extra /html>) generated by vite-ssg
    const htmlTag = '</html>'
    if (!indexFile.endsWith(htmlTag)) {
      consola.warn('fix incomplete index.html...')
      const htmlTagStart = indexFile.lastIndexOf(htmlTag)
      await fs.writeFile(indexPath, indexFile.slice(0, htmlTagStart + htmlTag.length), 'utf-8')
    }
  }

  if (!options.config.siteConfig.redirects?.useVueRouter)
    await generateClientRedirects(options)
}

export async function generateClientRedirects(options: ResolvedValaxyOptions) {
  consola.info('generate client redirects...')
  const outputPath = resolve(options.userRoot, 'dist')
  const redirectRules = collectRedirects(options.redirects)

  const task = redirectRules.map(async (rule) => {
    const fromPath = join(outputPath, `${rule.from}.html`)
    const toPath = join(outputPath, `${rule.to}.html`)
    const routeExist = await fs.pathExists(toPath)
    if (!routeExist)
      throw new Error(`the route of '${rule.to}' not exists`)
    await writeRedirectFiles(rule.to, fromPath)
  })

  await Promise.all(task)
}
