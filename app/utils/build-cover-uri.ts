export const buildCoverUri = createUnrefFn((filePath: string, mode: 'thumbnail' | 'full' = 'thumbnail') => `cover-${mode}://localhost/${encodeURIComponent(filePath)}`)
