<script setup lang="ts">
import type { Post } from 'valaxy'
import { useSiteStore } from 'valaxy'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
}>(), {
  curPage: 1,
})

const site = useSiteStore()
const posts = computed(() => {
  const list = props.posts || site.postList
  return list.filter(p => p.path && !p.path.endsWith('/'))
})
</script>

<template>
  <ul class="divide-y divide-gray-200">
    <TransitionGroup name="fade">
      <li v-for="post, i in posts" :key="i" class="py-8">
        <PressArticleCard :post="post" />
      </li>
    </TransitionGroup>
  </ul>
</template>
