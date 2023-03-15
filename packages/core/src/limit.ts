import * as pLimit from 'p-limit'

const MAX_CONCURRENCY = 5

export const limit = pLimit(MAX_CONCURRENCY)
