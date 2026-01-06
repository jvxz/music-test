import { Menu } from '@tauri-apps/api/menu'

export default defineNuxtPlugin({
  parallel: true,
  setup: (app) => {
    const vue = app.vueApp

    vue.directive('context-menu', {
      created: (el: HTMLElement, { value }: { value: Menu | undefined }) => {
        (el as any).__contextMenu = value

        useEventListener(el, 'contextmenu', async (event) => {
          event.preventDefault()

          const currentMenu = (el as any).__contextMenu

          if (currentMenu instanceof Menu) {
            await currentMenu.popup()
          }
        })
      },
      updated: (el: HTMLElement, { value }: { value: Menu | undefined }) => {
        (el as any).__contextMenu = value
      },
    })
  },
})
