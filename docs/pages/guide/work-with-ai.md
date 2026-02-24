---
title:
  en: Work with AI
  zh-CN: 与 AI 协作
categories:
  - guide
---

## Agent Skills {lang="en"}

## Agent Skills {lang="zh-CN"}

::: tip

<div lang="zh-CN">
🧪 实验性：Valaxy Skills 目前为实验性功能，正在积极开发中，欢迎反馈。
</div>

<div lang="en">
🧪 Experimental: Valaxy Skills are currently experimental and under active development, feedbacks are welcome.
</div>

:::

::: zh-CN

[Valaxy Skills](https://github.com/YunYouJun/valaxy/tree/main/skills) 是由 Valaxy 团队维护的 AI Agent Skills。

安装 Skill 后，当你使用 AI Agent 来辅助开发 Valaxy 站点时，它可以自动利用 Valaxy 提供的丰富功能集。

这使得 Agent 能够准确使用 Valaxy 的配置、主题、插件等功能。

:::

::: en

[Valaxy Skills](https://github.com/YunYouJun/valaxy/tree/main/skills) are AI Agent Skills maintained by the Valaxy team.

After installing the skill, when you use an AI Agent to assist with developing Valaxy sites, it can automatically leverage the rich feature set provided by Valaxy.

This allows the agent to accurately use Valaxy configurations, themes, addons, and more **without requiring an internet connection or additional permissions**.

:::

### Installation {lang="en"}

### 安装 {lang="zh-CN"}

```bash
npx skills add YunYouJun/valaxy
```

### Usage {lang="en"}

### 使用 {lang="zh-CN"}

::: zh-CN

#### 使用 Agent 开发 Valaxy 站点

示例提示词：

```
创建一个 Valaxy 博客站点：
- 使用 valaxy-theme-yun 主题
- 配置 Algolia 搜索
- 添加 Waline 评论插件
- 启用 llms.txt 输出
- 自定义导航与侧边栏
```

Agent 将自动引用 Valaxy Skills 中的知识来正确配置 `site.config.ts` 和 `valaxy.config.ts`，使用合适的 API（如 `defineSiteConfig`、`defineValaxyConfig`），并遵循 Valaxy 的最佳实践。

:::

::: en

#### Using an Agent to Develop Valaxy Sites

Example prompt:

```
Create a Valaxy blog site with:
- valaxy-theme-yun theme
- Algolia search configuration
- Waline comment addon
- llms.txt output enabled
- Custom navigation and sidebar
```

The agent will automatically reference Valaxy Skills knowledge to correctly configure `site.config.ts` and `valaxy.config.ts`, use the appropriate APIs (such as `defineSiteConfig`, `defineValaxyConfig`), and follow Valaxy best practices.

:::

## CLAUDE.md {lang="en"}

## CLAUDE.md {lang="zh-CN"}

::: zh-CN

Valaxy 仓库内置了 [CLAUDE.md](https://github.com/YunYouJun/valaxy/blob/main/CLAUDE.md) 文件，用于为 [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) 等 AI 工具提供项目上下文。

该文件包含：

- 项目架构概览（Monorepo 结构、核心包结构）
- 常用命令（开发、构建、测试、Lint）
- 配置流程（Config Merging、Roots System、Virtual Modules）
- 主题与插件开发指南
- 测试策略与部署方式

如果你使用 Claude Code 或其他支持 `CLAUDE.md` 的 AI 工具来开发 Valaxy，它将自动读取该文件以获得更准确的上下文理解。

:::

::: en

The Valaxy repository includes a built-in [CLAUDE.md](https://github.com/YunYouJun/valaxy/blob/main/CLAUDE.md) file that provides project context for AI tools like [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview).

This file contains:

- Project architecture overview (monorepo structure, core package structure)
- Common commands (development, building, testing, linting)
- Configuration flow (Config Merging, Roots System, Virtual Modules)
- Theme and addon development guide
- Testing strategy and deployment methods

If you use Claude Code or other AI tools that support `CLAUDE.md` to develop Valaxy, it will automatically read this file for more accurate context understanding.

:::

## llms.txt {lang="en"}

## llms.txt {lang="zh-CN"}

::: zh-CN

Valaxy 内置了 [llms.txt](https://llmstxt.org/) 支持，可以为你的博客生成 AI 可读的纯文本内容。

在 `site.config.ts` 中启用：

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  llms: {
    enable: true,
  },
})
```

启用后，Valaxy 将自动生成：

- `/llms.txt` — 站点索引，包含所有文章的标题、描述和链接
- `/llms-full.txt` — 完整内容，包含所有文章的全文（可通过 `fullText: false` 关闭）
- `/posts/xxx.md` — 每篇文章的原始 Markdown 文件（可通过 `files: false` 关闭）

#### 配置选项

```ts
export default defineSiteConfig({
  llms: {
    enable: true,
    // 是否生成 llms-full.txt（默认 true）
    fullText: true,
    // 是否为每篇文章生成独立的 .md 文件（默认 true）
    files: true,
    // 自定义提示词（添加到 llms.txt 的引用块部分）
    prompt: '',
    // 要包含的文件 glob 模式（相对于 pages/ 目录，默认 ['posts/**/*.md']）
    include: ['posts/**/*.md'],
  },
})
```

#### CLI 命令

你也可以单独生成 llms.txt 相关文件：

```bash
npx valaxy llms
```

:::

::: en

Valaxy has built-in [llms.txt](https://llmstxt.org/) support to generate AI-readable plain text content for your blog.

Enable it in `site.config.ts`:

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  llms: {
    enable: true,
  },
})
```

Once enabled, Valaxy will automatically generate:

- `/llms.txt` — Site index with titles, descriptions, and links for all posts
- `/llms-full.txt` — Full content with complete text of all posts (disable with `fullText: false`)
- `/posts/xxx.md` — Raw Markdown files for each post (disable with `files: false`)

#### Configuration Options

```ts
export default defineSiteConfig({
  llms: {
    enable: true,
    // Whether to generate llms-full.txt (default: true)
    fullText: true,
    // Whether to generate individual .md files for each post (default: true)
    files: true,
    // Custom prompt text (added to the llms.txt blockquote section)
    prompt: '',
    // Glob patterns for files to include (relative to pages/, default: ['posts/**/*.md'])
    include: ['posts/**/*.md'],
  },
})
```

#### CLI Command

You can also generate llms.txt files separately:

```bash
npx valaxy llms
```

:::
