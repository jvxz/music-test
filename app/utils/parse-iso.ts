export function parseISO(s: string): Date {
  return new Date(
    Date.UTC(
      +s.slice(0, 4), // year
      +s.slice(5, 7) - 1, // month (0-indexed)
      +s.slice(8, 10), // day
      +s.slice(11, 13), // hour
      +s.slice(14, 16), // minute
      +s.slice(17, 19), // second
      +s.slice(20, 23), // millisecond
    ),
  )
}
