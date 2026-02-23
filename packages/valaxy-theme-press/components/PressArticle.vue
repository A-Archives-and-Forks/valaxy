<script setup lang="ts">
import { formatDate, useFrontmatter, useSiteStore, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'

import { useRoute } from 'vue-router'

const frontmatter = useFrontmatter()

const route = useRoute()
const site = useSiteStore()

function findCurrentIndex() {
  return site.postList.findIndex(p => p.path === route.path)
}

const nextPost = computed(() => site.postList[findCurrentIndex() - 1])
const prevPost = computed(() => site.postList[findCurrentIndex() + 1])
const posts = computed(() => site.postList.filter(p => p.path && !p.path.endsWith('/')))

const { $tO } = useValaxyI18n()
const $title = computed(() => $tO(frontmatter.value.title))

const createdDate = computed(() => frontmatter.value.date ? formatDate(frontmatter.value.date) : '')
const updatedDate = computed(() => frontmatter.value.updated ? formatDate(frontmatter.value.updated) : '')
</script>

<template>
  <article class="xl:divide-y xl:divide-gray-200 max-w-7xl m-auto" p="x-6" w="full">
    <header class="pt-20 xl:pb-10 text-center">
      <h1
        class="
          text-3xl
          leading-9
          font-extrabold
          tracking-tight
          sm:text-4xl sm:leading-10
          md:text-5xl md:leading-14
          mb-4
        "
      >
        {{ $title }}
      </h1>
      <div class="flex items-center justify-center gap-4 text-sm text-gray-500">
        <span v-if="createdDate" class="inline-flex items-center gap-1">
          <span class="i-ri-calendar-line" />
          <time :datetime="createdDate">{{ createdDate }}</time>
        </span>
        <span v-if="updatedDate && updatedDate !== createdDate" class="inline-flex items-center gap-1">
          <span class="i-ri-edit-line" />
          <time :datetime="updatedDate">{{ updatedDate }}</time>
        </span>
      </div>
      <div v-if="frontmatter.tags?.length || frontmatter.categories" class="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs">
        <span
          v-for="tag in (Array.isArray(frontmatter.tags) ? frontmatter.tags : [])" :key="tag"
          class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          #{{ tag }}
        </span>
      </div>
    </header>

    <div
      class="
        divide-y
        xl:divide-y-0
        divide-gray-200
        xl:grid xl:grid-cols-12 xl:gap-x-6
        pb-16
        xl:pb-20
      "
      style="grid-template-rows: auto 1fr"
    >
      <PressAuthor v-if="frontmatter.author" :frontmatter="frontmatter" />
      <div class="divide-y divide-gray-200 xl:pb-0 xl:col-span-8 xl:row-span-2">
        <RouterView />
      </div>

      <footer
        class="
          text-sm
          font-medium
          leading-5
          divide-y divide-gray-200
          xl:col-start-1 xl:row-start-2 xl:col-span-2
        "
      >
        <div v-if="nextPost && nextPost.path" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500">
            Next Article
          </h2>
          <div class="link">
            <RouterLink :to="nextPost.path">
              {{ $tO(nextPost.title) }}
            </RouterLink>
          </div>
        </div>
        <div v-if="prevPost && prevPost.path" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500">
            Previous Article
          </h2>
          <div class="link">
            <RouterLink :to="prevPost.path">
              {{ $tO(prevPost.title) }}
            </RouterLink>
          </div>
        </div>

        <div v-if="posts.length" class="py-8">
          <h2 class="text-xs tracking-wide uppercase text-gray-500 mb-4">
            All Posts
          </h2>
          <ul class="space-y-2">
            <li v-for="post in posts" :key="post.path">
              <RouterLink
                class="link block truncate" :class="post.path === route.path ? 'font-bold text-primary' : 'op-50 hover:op-80'"
                :to="post.path || ''"
                :title="$tO(post.title)"
              >
                {{ $tO(post.title) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="pt-8">
          <RouterLink class="link" to="/posts/">
            ← Back to Posts
          </RouterLink>
        </div>
      </footer>
    </div>
  </article>
</template>
