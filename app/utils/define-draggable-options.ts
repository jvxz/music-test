import type { Options as DraggableOptions } from 'vue-draggable-plus'
import defu from 'defu'

interface Opts {
  sourceOnly: boolean
  draggableOpts: DraggableOptions
}

export function defineDraggableOptions(name: string, opts: Opts): DraggableOptions {
  return defu(
    opts.sourceOnly
      ? {
          ...opts,
          group: {
            ...(typeof opts.draggableOpts.group === 'object' ? opts.draggableOpts.group : {}),
            name,
            pull: 'clone',
            put: false,
          },
          sort: false,
        }
      : opts.draggableOpts,
    {
      animation: 0,
      fallbackOnBody: true,
      forceFallback: true,
    },
  )
}
