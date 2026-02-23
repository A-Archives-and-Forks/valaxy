<script lang="ts" setup>
import { useFrontmatter, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'

const frontmatter = useFrontmatter()
const { $tO } = useValaxyI18n()
const title = computed(() => $tO(frontmatter.value.title))
</script>

<template>
  <Layout>
    <template #main-content>
      <div class="max-w-6xl mx-auto w-full pb-12 px-4 sm:px-6 lg:px-8">
        <div class="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 class="text-3xl leading-9 font-extrabold text-gray-900 dark:text-gray-100 tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-13">
            {{ title }}
          </h1>
        </div>
        <PressPostList />
      </div>
    </template>
  </Layout>
</template>
