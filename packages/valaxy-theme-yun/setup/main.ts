import { MotionPlugin } from '@vueuse/motion'
import { defineAppSetup } from 'valaxy'
import { useYunAppStore } from '../stores'

export default defineAppSetup((ctx) => {
  const { router, app } = ctx
  // https://motion.vueuse.org/
  app.use(MotionPlugin)

  router.afterEach(() => {
    /**
     * router import order
     * @see https://pinia.vuejs.org/zh/core-concepts/outside-component-usage.html#single-page-applications
     */
    const app = useYunAppStore()
    if (app.fullscreenMenu.isOpen)
      app.fullscreenMenu.toggle()
  })
})
