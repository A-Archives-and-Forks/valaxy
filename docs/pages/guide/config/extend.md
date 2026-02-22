---
title:
  en: Extend Config
  zh-CN: 扩展配置
categories:
  - config
---

::: tip

<div lang="zh-CN">
扩展配置是 Valaxy 提供的高阶配置，允许你自定义更多与底层/构建相关的配置。
</div>

<div lang="en">
Extend Config is an advanced configuration provided by Valaxy, allowing you to customize more low-level and build-related settings.
</div>

:::

::: zh-CN
以下是所有的扩展配置项与相关类型。
:::

::: en
Below are all the extend configuration options and related types.
:::

> [packages/valaxy/node/types/index.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types/index.ts)

::: details package/valaxy/node/types/index.ts ValaxyExtendConfig

<<< @/../packages/valaxy/node/types/index.ts#snippet{ts:line-numbers}

<<< @/../packages/valaxy/node/types/config.ts#snippet{ts:line-numbers}

:::

::: zh-CN
所以，你可以像这样使用：
:::

::: en
So you can use it like this:
:::

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonComponents } from 'valaxy-addon-components'
import { VitePWA } from 'vite-plugin-pwa'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  siteConfig: {},

  theme: 'yun',
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },

  vite: {
    // https://vite-pwa-org.netlify.app/
    plugins: [VitePWA()],
  },

  unocss: {
    safelist,
  },

  addons: [
    addonComponents()
  ],
})
```

### Build

:::: zh-CN

`build` 字段用于配置 `valaxy build` 的构建行为。

::::

:::: en

The `build` field configures the behavior of `valaxy build`.

::::

#### ssgForPagination

:::: zh-CN

启用后，Valaxy 会为分页页面生成独立的静态 HTML（如 `/page/1`、`/page/2` 等）。默认 `false`。

::::

:::: en

When enabled, Valaxy generates static HTML for pagination pages (e.g., `/page/1`, `/page/2`). Default is `false`.

::::

#### foucGuard

:::: zh-CN

FOUC（Flash of Unstyled Content）防护配置。通过在 `<head>` 中内联 `body { opacity: 0 !important }` 隐藏页面，并通过 JS 监测所有样式表（包括 beasties 异步加载的样式表）加载完成后，移除该隐藏样式标签以显示页面，防止首屏样式闪烁和样式分批渲染的问题。

- `enabled`（默认 `true`）：是否启用 FOUC 防护
- `maxDuration`（默认 `5000`）：最大等待时间（毫秒），作为 CSS 加载失败时的安全兜底。设为 `0` 可禁用超时兜底

::::

:::: en

FOUC (Flash of Unstyled Content) guard. Inlines `body { opacity: 0 !important }` in `<head>` and uses JS to monitor all stylesheets (including async ones loaded by beasties) until they finish loading, then removes the hidden style tag to reveal the page with a smooth fade-in.

- `enabled` (default `true`): enable/disable the guard
- `maxDuration` (default `5000`): max wait time (ms) before force-showing the page. Set to `0` to disable the timeout fallback

::::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  build: {
    ssgForPagination: false,
    foucGuard: {
      enabled: true,
      maxDuration: 5000,
    },
  },
})
```

### @vitejs/plugin-vue

::: zh-CN
Valaxy 默认集成了 [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 插件，你可以通过 `vue` 配置项进行配置。
:::

::: en
Valaxy integrates [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) by default. You can configure it via the `vue` option.
:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('my-')
      }
    }
  }
})
```

### Vite

::: zh-CN
你可以参见 [Vite 文档](https://vite.dev/config/shared-options.html) 自定义 Vite 相关配置。
:::

::: en
You can refer to the [Vite documentation](https://vite.dev/config/shared-options.html) to customize Vite-related configurations.
:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    plugins: []
  }
})
```

### SSG Options

::: zh-CN

Valaxy 使用 [vite-ssg](https://github.com/antfu-collective/vite-ssg) 进行静态站点生成。
你可以通过 `vite.ssgOptions` 自定义 SSG 行为。

:::

::: en

Valaxy uses [vite-ssg](https://github.com/antfu-collective/vite-ssg) for Static Site Generation.
You can customize SSG behavior via `vite.ssgOptions`.

:::

::: zh-CN

Valaxy 默认设置了以下 SSG 选项，用户配置会覆盖这些默认值：

- `script`: `'async'` — 脚本加载模式
- `formatting`: `'minify'` — HTML 输出格式
- `beastiesOptions.preload`: `'media'` — 非关键 CSS 预加载策略（[详见 beasties](https://github.com/danielroe/beasties#preload)）
- `onFinished` — 构建完成后自动生成 sitemap（始终执行，用户回调会在其后运行）

完整参数列表请参见 [ViteSSGOptions](https://github.com/antfu-collective/vite-ssg)。

:::

::: en

Valaxy sets the following SSG defaults. User values override them:

- `script`: `'async'` — script loading mode
- `formatting`: `'minify'` — HTML output formatting
- `beastiesOptions.preload`: `'media'` — non-critical CSS preload strategy ([see beasties](https://github.com/danielroe/beasties#preload))
- `onFinished` — auto-generates sitemap after build (always runs; user callback runs after it)

See [ViteSSGOptions](https://github.com/antfu-collective/vite-ssg) for the full parameter list.

:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vite: {
    ssgOptions: {
      // 输出目录风格: 'flat' | 'nested'
      // flat: /foo → /foo.html
      // nested: /foo → /foo/index.html
      dirStyle: 'nested',

      // 关键 CSS 内联 (beasties) 配置
      // 设为 false 可完全禁用
      beastiesOptions: {
        preload: 'media',
      },

      // 构建完成后的回调（Valaxy 的 sitemap 生成始终会先执行）
      async onFinished() {
        console.log('SSG build finished!')
      },

      // 自定义要生成的路由
      // includedRoutes(paths, routes) {
      //   return paths.filter(p => !p.includes(':'))
      // },

      // 脚本加载模式: 'sync' | 'async' | 'defer' | 'async defer'
      // script: 'async',

      // HTML 格式化: 'none' | 'minify' | 'prettify'
      // formatting: 'minify',

      // SSG 并发数
      // concurrency: 20,
    },
  },
})
```

### Markdown

::: zh-CN
可自定义 Markdown 相关配置，如代码主题、区块内容、添加 `markdown-it` 插件、transformer 等。

效果参见: [Markdown](/guide/markdown)。
:::

::: en
You can customize Markdown-related configurations, such as code themes, block content, adding `markdown-it` plugins, transformers, etc.

See the effect at: [Markdown](/guide/markdown).
:::

::: details valaxy/node/plugins/markdown/types.ts

<<< @/../packages/valaxy/node/plugins/markdown/types.ts

:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  markdown: {
    // default material-theme-palenight
    // theme: 'material-theme-palenight',
    theme: {
      // light: 'material-theme-lighter',
      light: 'github-light',
      // dark: 'material-theme-darker',
      dark: 'github-dark',
    },

    blocks: {
      tip: {
        icon: 'i-carbon-thumbs-up',
        text: 'ヒント',
        langs: {
          'zh-CN': '提示',
        },
      },
      warning: {
        icon: 'i-carbon-warning-alt',
        text: '注意',
      },
      danger: {
        icon: 'i-carbon-warning',
        text: '警告',
      },
      info: {
        text: 'información',
      },
    },

    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code')
        },
      },
    ],

    config(md) {
      // md.use(xxx)
    }
  },
})
```

### DevTools

::: zh-CN
设置 `devtools: false` 以关闭 DevTools。
:::

::: en
Set `devtools: false` to disable DevTools.
:::

### 插件 Addons {lang="zh-CN"}

### Addons {lang="en"}

::: zh-CN
参见 [使用插件](/addons/use)。
:::

::: en
See [Using Addons](/addons/use).
:::

### UnoCSS

::: zh-CN
参见 [UnoCSS](/guide/config/unocss-options)。
:::

::: en
See [UnoCSS](/guide/config/unocss-options).
:::

### Modules

#### RSS

::: zh-CN

Valaxy 内置了 RSS 模块，你可以在 `valaxy.config.ts` 中通过 `modules.rss` 配置项进行配置。

- `enable`: 是否启用 RSS 模块。默认 `true`，启用。
- `fullText`: 是否输出文章全文。默认 `false`，只输出摘要。
- `extractImagePathsFromHTML`: 是否从构建后的 HTML 中提取图片路径（用于解析 Vite 打包后的 hash 文件名）。默认 `true`，启用。

:::

::: en

Valaxy has a built-in RSS module, which can be configured in `valaxy.config.ts` through the `modules.rss` configuration item.

- `enable`: Whether to enable the RSS module. Default is `true`, enabled.
- `fullText`: Whether to output the full text of the article. Default is `false`, only the summary is output.
- `extractImagePathsFromHTML`: Whether to extract image paths from built HTML files (to resolve Vite hashed filenames). Default is `true`, enabled.

:::

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  modules: {
    rss: {
      enable: true,
      fullText: false,
      // 当设置为 true 时，会从构建后的 HTML 中提取图片的实际路径（包含 hash）
      // When set to true, it will extract actual image paths (with hash) from built HTML
      extractImagePathsFromHTML: true,
    },
  },
})
```

::: zh-CN

**关于 `extractImagePathsFromHTML`**

当你在 Markdown 中使用相对路径引用图片时（如 `![pic](test.webp)`），Vite 会将图片打包并生成带 hash 的文件名（如 `/assets/test.zBFFFKJX.webp`）。

- 启用此选项（默认）：RSS feed 中的图片 URL 将使用构建后的实际路径，如 `https://example.com/assets/test.zBFFFKJX.webp`
- 禁用此选项：RSS feed 中的图片 URL 将基于文章目录构建，如 `https://example.com/posts/article-name/test.webp`

大多数情况下，你应该保持此选项为 `true`，以确保 RSS 阅读器能正确加载图片。

:::

::: en

**About `extractImagePathsFromHTML`**

When you reference images with relative paths in Markdown (e.g., `![pic](test.webp)`), Vite will bundle the image and generate a hashed filename (e.g., `/assets/test.zBFFFKJX.webp`).

- When enabled (default): Image URLs in RSS feed will use the actual built paths, like `https://example.com/assets/test.zBFFFKJX.webp`
- When disabled: Image URLs in RSS feed will be constructed based on the post directory, like `https://example.com/posts/article-name/test.webp`

In most cases, you should keep this option as `true` to ensure RSS readers can load images correctly.

:::

#### LLMS

::: zh-CN

Valaxy 内置了 LLMS 模块，遵循 [llms.txt 标准](https://llmstxt.org/)，在构建时生成 AI 可读的 Markdown 内容。

启用后，构建产物中将包含：

- `/llms.txt` — 站点页面索引，按目录分组，包含指向各 `.md` 文件的链接
- `/llms-full.txt` — 所有页面内容的合集（可选）
- `/*.md` — 每个页面的原始 Markdown 文件，可通过 URL 直接访问

同时，主题可以利用 `useCopyMarkdown()` composable 为文章页添加「复制 Markdown」按钮（Yun 主题已内置支持）。

- `enable`: 是否启用 LLMS 模块。默认 `false`，关闭。
- `files`: 是否为每个页面生成独立的 `.md` 文件。默认 `true`。
- `fullText`: 是否生成 `llms-full.txt`（包含所有页面完整内容）。默认 `true`。
- `prompt`: 自定义提示词，添加到 `llms.txt` 的描述部分。默认 `''`。
- `include`: 要包含的 Markdown 文件 glob 模式（相对于 `pages/` 目录）。默认 `['posts/**/*.md']` 仅包含 posts 目录。设为 `['**/*.md']` 可包含所有 `pages/` 下的 Markdown 文件，也可指定多个目录如 `['posts/**/*.md', 'guide/**/*.md']`。

`llms.txt` 中的页面会按顶级目录自动分组（如 `## Posts`、`## Guide` 等）。

:::

::: en

Valaxy has a built-in LLMS module, following the [llms.txt standard](https://llmstxt.org/), to generate AI-readable Markdown content during build.

When enabled, the build output will include:

- `/llms.txt` — Page index grouped by directory, with links to individual `.md` files
- `/llms-full.txt` — All page content concatenated (optional)
- `/*.md` — Raw Markdown files for each page, accessible via URL

Themes can use the `useCopyMarkdown()` composable to add a "Copy Markdown" button on post pages (built-in support in Yun theme).

- `enable`: Whether to enable the LLMS module. Default is `false`, disabled.
- `files`: Whether to generate individual `.md` files for each page. Default is `true`.
- `fullText`: Whether to generate `llms-full.txt` (with all page content inlined). Default is `true`.
- `prompt`: Custom prompt text, added to the `llms.txt` description section. Default is `''`.
- `include`: Glob patterns for markdown files to include (relative to `pages/` directory). Default is `['posts/**/*.md']` to only include posts. Set to `['**/*.md']` to include all markdown files under `pages/`. You can also specify multiple directories, e.g. `['posts/**/*.md', 'guide/**/*.md']`.

Pages in `llms.txt` are automatically grouped by their top-level directory (e.g. `## Posts`, `## Guide`, etc.).

:::

```ts [site.config.ts]
export default defineSiteConfig({
  llms: {
    enable: true,
    files: true,
    fullText: true,
    prompt: '',
    // Default: only posts
    // include: ['posts/**/*.md'],

    // Include all markdown files under pages/
    // include: ['**/*.md'],

    // Include specific directories
    // include: ['posts/**/*.md', 'guide/**/*.md'],
  },
})
```

### CDN Externals {lang="en"}

### CDN 外部化 {lang="zh-CN"}

::: zh-CN

> 实验性功能

通过 `cdn.modules` 配置项，你可以指定某些 npm 包在构建时从 CDN 加载，而非打包到最终产物中。
这可以显著减小构建产物体积，并利用 CDN 加速资源加载。

该配置仅在 `valaxy build` 时生效，开发模式下不受影响。

:::

::: en

> Experimental

With the `cdn.modules` option, you can specify certain npm packages to be loaded from CDN at runtime instead of being bundled.
This can significantly reduce bundle size and leverage CDN for faster resource loading.

This option only takes effect during `valaxy build`, not in dev mode.

:::

:::: tip

::: zh-CN
`cdn.modules` 中的每个模块需要提供以下字段：

- `name`: npm 包名（如 `'katex'`）
- `global`: 该库在 `window` 上暴露的全局变量名（如 `'katex'`）
- `url`: CDN 脚本的完整 URL
- `css`（可选）: CDN 样式表的完整 URL
- `exports`（可选）: 需要重新导出的命名导出列表（如 `['ref', 'computed']`）
:::

::: en
Each module in `cdn.modules` requires the following fields:

- `name`: npm package name (e.g., `'katex'`)
- `global`: global variable name the library exposes on `window` (e.g., `'katex'`)
- `url`: full CDN URL to the UMD/IIFE script
- `css` (optional): full CDN URL to the stylesheet
- `exports` (optional): named exports to re-export from the global variable (e.g., `['ref', 'computed']`)
:::

::::

#### 示例：通过 CDN 加载 KaTeX {lang="zh-CN"}

#### Example: Load KaTeX from CDN {lang="en"}

::: zh-CN
KaTeX 默认会被打包进构建产物。如果你希望通过 CDN 加载 KaTeX 以减小打包体积，可以如下配置：
:::

::: en
KaTeX is bundled into the build output by default. If you want to load it from CDN to reduce bundle size, you can configure it as follows:
:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  cdn: {
    modules: [
      {
        name: 'katex',
        global: 'katex',
        url: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js',
        css: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css',
      },
    ],
  },
})
```

::: zh-CN

你也可以使用其他 CDN 源，只需替换 URL 即可。例如使用 unpkg：

:::

::: en

You can also use other CDN providers by replacing the URL. For example, using unpkg:

:::

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  cdn: {
    modules: [
      {
        name: 'katex',
        global: 'katex',
        url: 'https://unpkg.com/katex@0.16.21/dist/katex.min.js',
        css: 'https://unpkg.com/katex@0.16.21/dist/katex.min.css',
      },
    ],
  },
})
```
