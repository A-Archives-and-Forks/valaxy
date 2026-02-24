---
title:
  en: FAQ
  zh-CN: 常见问题
categories:
  - dev
end: false
---

<details>

<summary>已解决</summary>

## `background-attachment: fixed` iOS 不支持

> iOS has an issue preventing background-attachment: fixed from being used with background-size: cover.
> [The Fixed Background Attachment Hack | CSS Tricks](https://css-tricks.com/the-fixed-background-attachment-hack/)

改为使用 `::before` 伪元素实现。

</details>

## JavaScript heap out of memory {lang="zh-CN"}

## JavaScript heap out of memory {lang="en"}

::: zh-CN

SSG 构建（`valaxy build --ssg`）时，[vite-ssg](https://github.com/antfu-collective/vite-ssg) 在同一进程中依次执行 client 构建、server 构建、页面渲染。构建阶段的 Vite resolved config 和插件系统会驻留内存，导致渲染阶段可用堆空间有限。

**最低内存要求：`--max-old-space-size=2304`（约 2.3 GB）**

```bash
# 复现测试
pnpm test:space        # demo/yun
pnpm test:space:docs   # docs
```

Valaxy 会根据 V8 的 `heap_size_limit` 自动调整 SSG 行为：

| 堆限制 | beasties (Critical CSS) | HTML minify | 并发数 |
|--------|------------------------|-------------|--------|
| ≤ 2.5 GB | 禁用 | 禁用 | 1 |
| ≤ 3.1 GB | 启用 | 启用 | 2 |
| ≤ 4.2 GB | 启用 | 启用 | 4 |
| > 4.2 GB | 启用 | 启用 | 8+ |

如果你在 CI 环境中遇到 OOM，可以通过设置 `NODE_OPTIONS` 增大堆限制：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
```

:::

::: en

During SSG build (`valaxy build --ssg`), [vite-ssg](https://github.com/antfu-collective/vite-ssg) runs client build, server build, and page rendering in the same process. The Vite resolved config and plugin system from the build phase remain in memory, leaving limited heap space for the rendering phase.

**Minimum memory requirement: `--max-old-space-size=2304` (~2.3 GB)**

```bash
# Reproduce tests
pnpm test:space        # demo/yun
pnpm test:space:docs   # docs
```

Valaxy automatically adjusts SSG behavior based on V8's `heap_size_limit`:

| Heap Limit | beasties (Critical CSS) | HTML minify | Concurrency |
|------------|------------------------|-------------|-------------|
| ≤ 2.5 GB | Disabled | Disabled | 1 |
| ≤ 3.1 GB | Enabled | Enabled | 2 |
| ≤ 4.2 GB | Enabled | Enabled | 4 |
| > 4.2 GB | Enabled | Enabled | 8+ |

If you encounter OOM in CI environments, increase the heap limit via `NODE_OPTIONS`:

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
```

:::

## 合并

使用 `defu`。

但实测 `defu` faster than `@fastify/deepmerge`。

合并单个配置：

- `defu`: 0.06ms
- [`@fastify/deepmerge`](https://github.com/fastify/deepmerge): 0.256ms

```bash
# benchmark
@fastify/deepmerge x 605,343 ops/sec ±0.87% (96 runs sampled)
deepmerge x 20,312 ops/sec ±1.06% (92 runs sampled)
merge-deep x 83,167 ops/sec ±1.30% (94 runs sampled)
ts-deepmerge x 175,977 ops/sec ±0.57% (96 runs sampled)
deepmerge-ts x 174,973 ops/sec ±0.44% (93 runs sampled)
lodash.merge x 89,213 ops/sec ±0.70% (98 runs sampled)
```
