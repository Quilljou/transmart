import { encode } from 'gpt-3-encoder'

export function splitJSONtoSmallChunks(
  object: Record<string, unknown>,
  options: { modelContextLimit: number; modelContextSplit: number },
) {
  const maxInputToken = Math.floor(options.modelContextLimit * options.modelContextSplit)
  const chunks: Record<string, unknown>[] = []
  const keys = Object.keys(object)
  const totalLength = keys.length
  let keysLength = totalLength

  let tempChunk: Record<string, unknown> = {}
  let chunkSize = 2
  while (keysLength > 0) {
    chunkSize += 1 // \n
    const key = keys[totalLength - keysLength]
    const value = object[key]
    chunkSize += encode(key).length + 2 // "key":
    const nextValueSize = isPlainObject(value) ? getJSONTokenSize(value, 1) : getPrimitiveValueSize(value)
    if (chunkSize + nextValueSize > maxInputToken) {
      // clear temp chunk
      chunks.push({ ...tempChunk })
      tempChunk = {}
      chunkSize = 0
      continue
    } else {
      tempChunk[key] = value
    }
    chunkSize += nextValueSize
    keysLength--
  }
  if (Object.keys(tempChunk).length) {
    chunks.push(tempChunk)
  }

  return chunks
}

export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
// almost close to json
function getJSONTokenSize(object: Record<string, unknown>, depth = 0): number {
  const keys = Object.keys(object)
  const totalLength = keys.length
  let keysLength = totalLength
  let tokenCount = 1 // {

  while (keysLength > 0) {
    const key = keys[totalLength - keysLength]
    const value = object[key]
    tokenCount += 1 // \n
    tokenCount += depth * 2 // indent
    tokenCount += encode(key).length + 2 // "key":
    if (isPlainObject(value)) {
      tokenCount += getJSONTokenSize(value, depth + 1)
    } else {
      tokenCount += getPrimitiveValueSize(value)
    }
    keysLength--
  }
  tokenCount += 2 // '\n'
  tokenCount += depth // }
  return tokenCount
}

function getPrimitiveValueSize(value: any): number {
  return encode(value).length + 3 // "value",
}
