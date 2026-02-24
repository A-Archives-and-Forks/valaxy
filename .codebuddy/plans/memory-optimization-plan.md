# Valaxy 内存优化计划

> 基于对 `packages/valaxy/node/` 的全面分析，按收益排序。

## 高收益（各 ~20-50 MB）

### TODO 1: localSearchPlugin 去掉 Shiki 高亮器
- **文件**: `packages/valaxy/node/plugins/localSearchPlugin.ts`
- **问题**: `createMarkdownRenderer(options)` 创建完整 MarkdownIt + Shiki，但搜索索引通过 `clearHtmlTags()` 丢弃所有 HTML → Shiki 输出完全浪费
- **方案**: 创建一个 `createLightMarkdownRenderer()` —— 使用空的 highlight 函数（直接返回转义文本），跳过 Shiki 初始化
- **预估节省**: ~20-50 MB（一个 Shiki 实例的主题+语法数据）

### TODO 2: 合并两个 Shiki 高亮器实例
- **文件**:
  - `packages/valaxy/node/plugins/markdown/transform/index.ts:35-37`（主插件）
  - `packages/valaxy/node/plugins/markdown/index.ts:32-34`（createMarkdownRenderer）
- **问题**: 两者使用完全相同的 `(theme, mdOptions)` 配置，各自调用 `createHighlighter()`
- **方案**: 抽取共享的 Shiki 实例工厂，首次创建后缓存，后续复用；dispose 时统一释放
- **预估节省**: ~20-50 MB
- **注意**: 需确保 TODO 1 完成后 localSearchPlugin 不再依赖此实例

## 中等收益（各 ~5-30 MB）

### TODO 3: vueRouter.ts 复用 MarkdownIt 或使用精简配置
- **文件**: `packages/valaxy/node/plugins/vueRouter.ts:59-60`
- **问题**: 创建第 3 个完整 MarkdownIt 实例（含所有插件），仅用于摘要渲染
- **方案**: 
  - A) 复用主插件的 MarkdownIt 实例（需导出引用）
  - B) 创建精简版：只加载 container/emoji/footnote 等必要插件，跳过 anchor/toc/sfc/lineNumbers 等
- **预估节省**: ~5-10 MB

### TODO 4: 移除 `_viteConfig` 未使用参数
- **文件**: `packages/valaxy/node/plugins/markdown/markdownToVue.ts:69`
- **问题**: `_viteConfig: ResolvedConfig` 参数未使用，但闭包持有引用阻止 GC 回收
- **方案**: 删除参数，同步修改调用处 `packages/valaxy/node/plugins/valaxy/index.ts`
- **预估节省**: ~10-30 MB（ResolvedConfig 含全部插件实例）
- **风险**: 低，参数确认未使用

### TODO 5: localSearchPlugin HMR 增量更新
- **文件**: `packages/valaxy/node/plugins/localSearchPlugin.ts:201-211`
- **问题**: 任何 .md 变更触发 `scanForBuild()` 全量重建（重新渲染所有页面）
- **方案**: 
  - 记录 `fileId → docIds[]` 映射
  - HMR 时只 `discard()` 旧条目 + 重新 `indexFile()` 变更文件
  - 需要访问 MiniSearch 内部的 `discard` 方法（或 `removeAll` + `addAll` 对单文件）
- **预估节省**: 减少 dev 模式下的内存峰值和 CPU 开销

## 小优化

### TODO 6: markdownToVue.ts cacheKey 修复
- **文件**: `packages/valaxy/node/plugins/markdown/markdownToVue.ts:93-95`
- **问题**: 外层 `JSON.stringify` 在非 build 模式下白白序列化；内层变量遮蔽重复计算
- **方案**: 将 `JSON.stringify` 移入 `if (isBuild)` 块内

### TODO 7: vueRouter.ts extendRoute 深拷贝外提
- **文件**: `packages/valaxy/node/plugins/vueRouter.ts:74`
- **问题**: 每个路由执行 `JSON.parse(JSON.stringify(frontmatter))`
- **方案**: 在 `extendRoute` 外部缓存 frontmatter 模板，内部用 `structuredClone()` 或浅拷贝

### TODO 8: bundle.ts Map 缓存构建后清理
- **文件**: `packages/valaxy/node/build/bundle.ts:6-7`
- **问题**: `cache` 和 `cacheTheme` 两个模块级 Map 永不清理
- **方案**: 导出 `clearBundleCache()` 函数，在 `ssgBuild()` 的 `onFinished` 中调用

## 执行顺序建议

1. **TODO 4** → 最简单，改两个文件即可验证
2. **TODO 6** → 简单修复
3. **TODO 1** → 高收益，独立修改
4. **TODO 2** → 高收益，需在 TODO 1 之后
5. **TODO 7** → 简单
6. **TODO 3** → 中等复杂度
7. **TODO 5** → 复杂度最高（需处理 MiniSearch 增量更新）
8. **TODO 8** → 简单但收益最小

## 验证方式

```bash
# 构建前后对比堆内存
NODE_OPTIONS="--max-old-space-size=2304 --expose-gc" pnpm test:space
NODE_OPTIONS="--max-old-space-size=2304 --expose-gc" pnpm test:space:docs

# 使用 V8 heap snapshot（开发时）
node --inspect packages/valaxy/bin/valaxy.mjs build --ssg
```
