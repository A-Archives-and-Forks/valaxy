import type { ConfigEnv, InlineConfig } from 'vite'
import type { ResolvedValaxyOptions } from './types'
import { join } from 'node:path'
import { uniq } from '@antfu/utils'
import fs from 'fs-extra'
import { loadConfigFromFile, mergeConfig } from 'vite'
import { toAtFS } from './utils'

/**
 * merge vite.config.ts (user & theme)
 * @internal
 */
export async function mergeViteConfigs({ userRoot, themeRoot }: ResolvedValaxyOptions, command: 'serve' | 'build') {
  const configEnv: ConfigEnv = {
    mode: 'development',
    command,
  }

  let resolvedConfig: InlineConfig = {}
  // let vite default config file be clientRoot/vite.config.ts
  const files = uniq([themeRoot, userRoot]).map(i => join(i, 'vite.config.ts'))

  const loadViteConfigPromiseArr = files.map(async (file) => {
    if (!await fs.exists(file))
      return
    return loadConfigFromFile(configEnv, file)
  })
  const viteConfigs = await Promise.all(loadViteConfigPromiseArr)

  for (const viteConfig of viteConfigs) {
    if (!viteConfig?.config)
      continue
    resolvedConfig = mergeConfig(resolvedConfig, viteConfig.config)
  }
  return resolvedConfig
}

/**
 * generate index.html from user/theme/client
 * @internal
 */
export async function getIndexHtml({ clientRoot, themeRoot, userRoot, config }: ResolvedValaxyOptions, rawHtml: string): Promise<string> {
  // get from template
  // use client index.html directly, than change it in transformIndexHtml

  // let main = await fs.readFile(indexTemplatePath, 'utf-8')
  let main = rawHtml
  let head = ''
  let body = ''

  if (config.siteConfig.favicon)
    head += `<link rel="icon" href="${config.siteConfig.favicon}">`

  const roots = [userRoot, themeRoot]

  if (config.siteConfig.mode === 'auto') {
    head += `
    <script>
    ;(function () {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
      if (setting === 'dark' || (prefersDark && setting !== 'light'))
        document.documentElement.classList.toggle('dark', true)
    })()
    </script>
  `

    // add it for first load
    head += `<style type="text/css">
    :root { color-scheme: light dark; --va-c-bg: #fff; }
    html.dark { --va-c-bg: #000; }
    html { background-color: var(--va-c-bg); }
  </style>`
  }

  /**
   * FOUC (Flash of Unstyled Content) guard.
   *
   * Inline `body { opacity: 0 }` hides the page content until the full
   * CSS bundle loads. The main stylesheet (`main.scss`) contains
   * `body { opacity: 1 }` which overrides this once applied, producing
   * a smooth fade-in via the inline `transition`.
   *
   * Fallbacks:
   * - `<noscript>`: ensures page is visible when JS is disabled.
   * - `window.onload`: reveals the page once all resources are loaded.
   * - `setTimeout` (configurable `maxDuration`): safety net in case CSS
   *   fails to load entirely; set to `0` to disable.
   *
   * @see build.foucGuard in ValaxyExtendConfig
   */
  const foucGuard = config.build.foucGuard ?? {}
  const foucEnabled = foucGuard.enabled ?? true
  const foucMaxDuration = foucGuard.maxDuration ?? 5000

  if (foucEnabled) {
    head += `<style type="text/css">body{opacity:0;transition:opacity .15s ease}</style>`
    head += `<noscript><style>body{opacity:1!important}</style></noscript>`

    const revealFn = `function __valaxyReveal(){document.body.style.opacity='1'}`
    const onloadScript = `window.addEventListener('load',__valaxyReveal)`
    const timeoutScript = foucMaxDuration > 0
      ? `;setTimeout(__valaxyReveal,${foucMaxDuration})`
      : ''

    head += `<script>${revealFn};${onloadScript}${timeoutScript}</script>`
  }

  if (config.siteConfig.lang) {
    head += `
    <script>
    const locale = localStorage.getItem('valaxy-locale') || '${config.siteConfig.lang}';
    document.documentElement.setAttribute('lang', locale);
    </script>
    `
  }

  for (const root of roots) {
    const path = join(root, 'index.html')
    if (!fs.existsSync(path))
      continue

    const indexHtml = await fs.readFile(path, 'utf-8')

    head += `\n${(indexHtml.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || '').trim()}`
    body += `\n${(indexHtml.match(/<body>([\s\S]*?)<\/body>/i)?.[1] || '').trim()}`
  }

  main = main
    .replace('__ENTRY__', toAtFS(join(clientRoot, 'main.ts')))
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}
