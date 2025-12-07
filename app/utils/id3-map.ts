/**
 * Common ID3v2 frame IDs mapped to their human-readable descriptors.
 * Covers the most frequently used frames from ID3v2.3/v2.4 specifications.
 */
export const ID3_MAP = {
  APIC: 'Front cover',
  COMM: 'Comments',
  POPM: 'Rating',
  TALB: 'Album',
  TCOM: 'Composer',
  TCON: 'Genre',
  TCOP: 'Copyright',
  TDRC: 'Recording date',
  TENC: 'Encoded by',
  TEXT: 'Lyricist',
  TIT2: 'Title',
  TLAN: 'Language',
  TPE1: 'Artist',
  TPE2: 'Album artist',
  TPE3: 'Conductor',
  TPE4: 'Remixer',
  TPOS: 'Disc number',
  TPUB: 'Publisher',
  TRCK: 'Track number',
  TSOA: 'Album sort order',
  TSOP: 'Artist sort order',
  TSOT: 'Title sort order',
  TSRC: 'ISRC code',
  TSSE: 'Encoder settings',
  TXXX: 'Custom text',
  TYER: 'Year',
  USLT: 'Lyrics',
  WCOM: 'Commercial URL',
  WCOP: 'Copyright URL',
  WOAR: 'Artist URL',
  WPUB: 'Publisher URL',
  WXXX: 'Custom URL',
} as const

export type Id3FrameId = keyof typeof ID3_MAP
