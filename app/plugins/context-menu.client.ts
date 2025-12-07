export default defineNuxtPlugin(() => {
  useEventListener('contextmenu', e => !import.meta.dev && e.preventDefault())
})
