import { confirm } from '@tauri-apps/plugin-dialog'
import isObjEqual from 'fast-deep-equal'

type TagMap = Partial<Record<Id3FrameId, string>>

interface ProposedChanges {
  mixedFrames: Map<Id3FrameId, string[]>
  frames: Partial<{
    [K in Id3FrameId]: {
      value: string
      type: 'set' | 'clear' | null
    }
  }>
}

const createFlattenedChanges = createUnrefFn((tracks: TrackListEntry[] | null | undefined) => {
  const originalTags: TagMap[] | undefined = tracks?.map(t => t.tags)

  const newChanges: ProposedChanges = { frames: {}, mixedFrames: new Map() }

  originalTags?.forEach((tagMap, idx) => {
    const tags = objectEntries(tagMap)

    if (idx === 0) {
      newChanges.frames = objectFromEntries(tags.map(([frame, value]) => [frame, {
        type: null,
        value: value ?? '',
      }]))
    }

    else {
      tags.forEach(([frame, value]) => {
        const baselineValue = newChanges.frames[frame]?.value ?? ''

        if (newChanges.frames[frame]?.value !== value) {
          const existingValue = newChanges.mixedFrames.get(frame)
          if (!existingValue)
            newChanges.mixedFrames.set(frame, [baselineValue, value ?? ''])
          else
            existingValue.push(value ?? '')
        }

        else {
          newChanges.frames[frame] = {
            type: null,
            value: value ?? '',
          }
        }
      })
    }
  })

  newChanges.mixedFrames.forEach((_, frame) => delete newChanges.frames[frame])

  return newChanges
})

export const [useProvideMetadata, useMetadataStore] = createInjectionState((tracks: MaybeRefOrGetter<TrackListEntry[] | null | undefined>) => {
  const { refreshTrackData } = useTrackData()

  let baseline: ProposedChanges = { frames: {}, mixedFrames: new Map() }
  const proposedChanges = ref<ProposedChanges>({ frames: {}, mixedFrames: new Map() })

  watch(() => toValue(tracks), (v) => {
    if (!v)
      return proposedChanges.value = { frames: {}, mixedFrames: new Map() }

    _resetChanges()
  }, { immediate: true })

  /**
   * if there is no track(s), there is nothing to edit
   */
  const isEditable = computed(() => {
    const tracksValue = toValue(tracks)
    if (!tracksValue)
      return false

    return !!tracksValue.length
  })

  const isEditingMultiple = computed(() => {
    const tracksValue = toValue(tracks)
    if (!tracksValue)
      return false

    return tracksValue.length > 1
  })

  const isDirty = computed(() => !isObjEqual(proposedChanges.value, baseline))

  const isValueDirty = createUnrefFn((frame: Id3FrameId) => {
    const targetFrame = proposedChanges.value.frames[frame]
    if (targetFrame?.type === null)
      return false

    else if (targetFrame?.type === 'set' || targetFrame?.type === 'clear')
      return !isObjEqual(baseline.frames[frame], targetFrame)

    else return false
  })

  const isValueBaselineEmpty = createUnrefFn((frame: Id3FrameId) => {
    return baseline.frames[frame]?.value === '' || !baseline.frames[frame]
  })

  function revertChange(frame: Id3FrameId) {
    const targetFrame = proposedChanges.value.frames[frame]
    if (targetFrame) {
      if (baseline.frames[frame])
        proposedChanges.value.frames[frame] = { ...baseline.frames[frame] }

      else
        delete proposedChanges.value.frames[frame]
    }
  }

  async function revertAllChanges() {
    const confirmation = await confirm('Are you sure you want to revert all changes?', {
      okLabel: 'Revert',
      title: 'Revert all changes',
    })

    if (!confirmation)
      return

    _resetChanges()
  }

  const { execute: commitChanges, isLoading: isCommittingChanges } = useAsyncState(async () => {
    if (!isDirty.value)
      return

    const confirmation = await confirm('Are you sure you want to commit changes?', {
      okLabel: 'Commit',
      title: 'Commit changes',
    })

    if (!confirmation)
      return

    const changes = objectEntries(proposedChanges.value.frames).filter(([frame, value]) => {
      // if the value is null or the type is null, no changes were made, skip
      if (!value || value.type === null)
        return false

      // if the type is set, check if the value is different from the baseline
      if (value.type === 'set')
        return value.value !== baseline.frames[frame]?.value

      // if the type is clear, return true
      return true
    })
    try {
      for (const track of toValue(tracks) ?? []) {
        await $invoke(
          commands.writeId3Frames,
          track.path,
          // todo: support user-defined tag type
          track.primary_tag ?? 'id3v2.4',
          changes.map(([frame, _value]) => {
            // value is guaranteed to be defined here
            const value = _value!

            // if the type is set, return the value
            if (value.type === 'set')
              return { frame, value: value.value }

            // type can only be clear here, so return an empty string to clear the frame
            return { frame, value: '' }
          }),
        )
      }
    }
    catch (err) {
      emitError({
        data: `Failed to commit changes: ${err}`,
        type: 'Other',
      })
    }
    finally {
      await refreshTrackData(toValue(tracks)?.map(t => t.path) ?? [])
      _resetChanges()
    }
  }, undefined, { immediate: false })

  function _resetChanges() {
    baseline = createFlattenedChanges(toValue(tracks))
    proposedChanges.value = {
      frames: objectFromEntries(
        objectEntries(baseline.frames).map(([frame, data]) => [frame, { ...data }]),
      ),
      mixedFrames: new Map(baseline.mixedFrames),
    }
  }

  return {
    commitChanges,
    isCommittingChanges,
    isDirty,
    isEditable,
    isEditingMultiple,
    isValueBaselineEmpty,
    isValueDirty,
    proposedChanges,
    revertAllChanges,
    revertChange,
  }
})
