import { confirm } from '@tauri-apps/plugin-dialog'
import isObjEqual from 'fast-deep-equal'

type TagMap = Partial<Record<Id3FrameId, string>>

interface ProposedChanges {
  mixedFrames: Set<Id3FrameId>
  frames: Partial<Record<Id3FrameId, string>>
}

const createFlattenedChanges = createUnrefFn((tracks: TrackListEntry[] | null | undefined) => {
  const originalTags: TagMap[] | undefined = tracks?.map(t => t.tags)

  const newChanges: ProposedChanges = { frames: {}, mixedFrames: new Set() }

  originalTags?.forEach((tagMap, idx) => {
    const tags = objectEntries(tagMap)

    if (idx === 0)
      newChanges.frames = { ...tagMap }

    else {
      tags.forEach(([frame, value]) => {
        if (newChanges.frames[frame] !== value)
          newChanges.mixedFrames.add(frame)

        else
          newChanges.frames[frame] = value
      })
    }
  })

  newChanges.mixedFrames.forEach(frame => delete newChanges.frames[frame])

  return newChanges
})

export const [useProvideMetadata, useMetadataStore] = createInjectionState((tracks: MaybeRefOrGetter<TrackListEntry[] | null | undefined>) => {
  const { refreshTrackData } = useTrackData()

  let baseline: ProposedChanges = { frames: {}, mixedFrames: new Set() }
  const proposedChangesRef = ref<ProposedChanges>({ frames: {}, mixedFrames: new Set() })
  const proposedChanges = computed({
    get: () => proposedChangesRef.value,
    set: (value: Id3FrameId | TrackListEntry[] | null | undefined) => {
      if (typeof value === 'object')
        proposedChangesRef.value = createFlattenedChanges(value)

      else if (value)
        proposedChangesRef.value.frames[value] = value
    },
  })

  watch(() => toValue(tracks), (v) => {
    baseline = createFlattenedChanges(v)
    proposedChangesRef.value = {
      frames: { ...baseline.frames },
      mixedFrames: new Set(baseline.mixedFrames),
    }
  }, { immediate: true })

  const isDirty = computed(() => !isObjEqual(proposedChanges.value, baseline))

  const isValueDirty = createUnrefFn((frame: Id3FrameId) => baseline.frames[frame] !== proposedChanges.value.frames[frame])

  function revertChange(frame: Id3FrameId) {
    proposedChanges.value.frames[frame] = baseline.frames[frame] ?? ''
  }

  async function revertAllChanges() {
    const confirmation = await confirm('Are you sure you want to revert all changes?', {
      okLabel: 'Revert',
      title: 'Revert all changes',
    })

    if (!confirmation)
      return

    proposedChangesRef.value = { ...baseline }
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

    const changes = objectEntries(proposedChanges.value.frames).filter(([frame, value]) => value !== '' && value !== baseline.frames[frame])
    try {
      for (const track of toValue(tracks) ?? []) {
        await $invoke(
          commands.writeId3Frames,
          track.path,
          track.primary_tag ?? 'id3v2.4',
          changes.map(([frame, value]) => ({ frame, value: value ?? '' })),
        )
      }
    }
    catch {
      emitError({
        data: 'Failed to commit changes',
        type: 'Other',
      })
    }
    finally {
      await refreshTrackData(toValue(tracks)?.map(t => t.path) ?? [])
      proposedChangesRef.value = createFlattenedChanges(toValue(tracks))
    }
  }, undefined, { immediate: false })

  return {
    commitChanges,
    isCommittingChanges,
    isDirty,
    isValueDirty,
    proposedChanges,
    revertAllChanges,
    revertChange,
  }
})
