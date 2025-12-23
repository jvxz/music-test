export default defineNuxtPlugin({
  dependsOn: ['tauri'],
  setup: () => {
    const { listen } = useTauri()

    const x = shallowRef<number>(0)
    const y = shallowRef<number>(0)
    const { element: overElement } = useElementByPoint({ x, y })

    const isDragging = shallowRef(false)
    const droppedItemPaths = shallowRef<string[]>([])

    listen('tauri://drag-over', (e) => {
      const payload = e.payload as { position: { x: number, y: number } }

      x.value = payload.position.x
      y.value = payload.position.y
      isDragging.value = true
    })

    listen('tauri://drag-leave', () => {
      isDragging.value = false
    })

    listen('tauri://drag-drop', (event) => {
      isDragging.value = false

      const payload = event.payload as { paths: string[] }

      droppedItemPaths.value = payload.paths
    })

    return {
      provide: {
        dragHandler: {
          droppedItemPaths,
          isDragging,
          overElement,
        },
      },
    }
  },
})
