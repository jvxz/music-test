export const buildCoverUri = createUnrefFn((filePath: string) => `cover://localhost/${encodeURIComponent(filePath)}`)
