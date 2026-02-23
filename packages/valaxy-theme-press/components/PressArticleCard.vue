<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  post: Post
}>()

const { $tO } = useValaxyI18n()
</script>

<template>
  <article class="press-article-card space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
    <PressDate :date="post.date" />
    <div class="space-y-5 xl:col-span-3">
      <div class="space-y-6">
        <h2 class="text-2xl leading-8 font-bold tracking-tight">
          <RouterLink class="press-article-card-link text-gray-900 dark:text-gray-100 hover:text-primary transition-colors" :to="post.path || ''">
            {{ $tO(post.title) }}
          </RouterLink>
        </h2>
        <div
          v-if="post.excerpt"
          class="press-article-card-excerpt prose dark:prose-invert max-w-none"
        >
          <ValaxyDynamicComponent :template-str="post.excerpt" />
        </div>
      </div>
      <div class="text-base leading-6 font-medium">
        <RouterLink class="press-article-card-link text-primary hover:underline" aria-label="read more" :to="post.path || ''">
          Read more →
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.press-article-card-link {
  text-decoration: none !important;
  border-bottom: none !important;
}

.press-article-card-excerpt :deep(a) {
  border-bottom: none;
}
</style>
