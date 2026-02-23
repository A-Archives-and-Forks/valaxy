<script setup lang="ts">
import type { Component } from 'vue'
import { compile, computed, defineComponent } from 'vue'

const props = withDefaults(
  defineProps<{
    templateStr: string
    data?: Record<string, any>
  }>(),
  {
    data: () => ({}),
  },
)

// Separate compile from component creation — compile() is expensive and
// should only re-run when the template string itself changes.
const compiledRender = computed(() => {
  if (!props.templateStr)
    return null
  return compile(props.templateStr)
})

// defineComponent creates a proper component instance so that compile()'s
// render function can access data properties through the instance context.
// Avoids defineAsyncComponent which causes "missing template" warnings in SSG.
const dynamicComponent = computed<Component | null>(() => {
  const render = compiledRender.value
  if (!render)
    return null
  return defineComponent({
    data: () => ({ ...props.data }),
    render,
  })
})
</script>

<template>
  <component :is="dynamicComponent" v-if="dynamicComponent" />
</template>
