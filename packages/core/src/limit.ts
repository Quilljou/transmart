import * as pLimit from 'p-limit'

const CONCURRENCY = 5

export const limit = pLimit(CONCURRENCY)
