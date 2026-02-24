import { confirm } from '@tauri-apps/plugin-dialog'
import isObjEqual from 'fast-deep-equal'
import { LRUCache } from 'lru-cache'

export type TagMap = Partial<Record<Id3FrameId, string>>

type Group = 'panel'

const instances = new LRUCache<string, Ref<TagMap>>({ max: 8 })

export function useMetadata(originalFile: MaybeRefOrGetter<TrackListEntry | null | undefined>, group?: Group | string & {}) {
  const { refreshTrackData } = useTrackData()
  const { currentTrack, resetPlayback } = usePlayback()

  const getOriginalTags = () => toValue(originalFile)?.tags
  const getKey = () => toValue(originalFile) ? `${toValue(originalFile)!.path}${group ? `-${group}` : ''}` : null
  const getInstance = () => {
    const key = getKey()
    if (!key)
      return ref<TagMap>({})

    const instance = instances.get(key)
    if (instance)
      return instance

    const newInstance = ref<TagMap>({ ...getOriginalTags() })
    instances.set(key, newInstance)
    return newInstance
  }

  const proposedChanges = computed({
    get: () => getInstance().value,
    set: value => getInstance().value = value,
  })

  const isDirty = computed(() => !isObjEqual(stripEmptyValues(proposedChanges.value), stripEmptyValues(getOriginalTags() ?? {})))

  const revertChange = createUnrefFn((frame: Id3FrameId) => {
    const originalTags = getOriginalTags()
    if (originalTags === undefined)
      return

    proposedChanges.value[frame] = originalTags[frame] ?? ''
  })

  async function revertAllChanges() {
    const confirmation = await confirm('Are you sure you want to revert all changes?', {
      okLabel: 'Revert',
      title: 'Revert all changes',
    })

    if (!confirmation)
      return

    proposedChanges.value = { ...getOriginalTags() }
  }

  async function commitChanges() {
    const confirmation = await confirm('Are you sure you want to commit changes?', {
      okLabel: 'Commit',
      title: 'Commit changes',
    })

    if (!confirmation)
      return

    const file = toValue(originalFile)
    const originalTags = file?.tags

    if (!file || !originalTags)
      return

    if (!(await exists(file.path))) {
      return emitError({
        data: `Unable to write metadata to file ${file.path} - file does not exist`,
        type: 'FileSystem',
      })
    }

    if (await isDir(file.path)) {
      return emitError({
        data: `Unable to write metadata to file ${file.path} - is a directory`,
        type: 'FileSystem',
      })
    }

    const changes = proposedChanges.value

    if (file?.path === currentTrack.value?.path) {
      await resetPlayback()
    }

    const frames = objectEntries(changes)
      .filter(([frame, value]) => originalTags[frame] !== value)
      .map(([frame, value]) => ({
        frame,
        value: value ?? '',
      }))

    // todo: make version selectable
    await $invoke(commands.writeId3Frames, file.path, file.primary_tag ?? 'id3v2.4', frames)
    await refreshTrackData(file.path)
  }

  const isValueDirty = createUnrefFn((frame: Id3FrameId) => {
    const originalTags = getOriginalTags()
    if (originalTags === undefined)
      return false

    if (proposedChanges.value[frame] === '' && !originalTags[frame])
      return false

    return proposedChanges.value[frame] !== originalTags[frame]
  })

  return {
    commitChanges,
    isDirty,
    isValueDirty,
    proposedChanges,
    revertAllChanges,
    revertChange,
  }
}

function stripEmptyValues(tags: Partial<Record<Id3FrameId, string>>) {
  return objectFromEntries(objectEntries(tags).filter(([_, value]) => value !== ''))
}
