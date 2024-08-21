import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import * as path from 'path'

/**
 * A function that returns a hash of the input data and output file paths
 * If any of the input data or output file paths change, the hash will change
 * @param inputNSFilePath
 * @param outputNSFilePath
 * @returns
 */
export const getPairHash = (inputNSFilePath: string, outputNSFilePath: string): string => {
  const data = readFileSync(inputNSFilePath, { encoding: 'utf-8' })
  const hash = createHash('sha1')
  hash.update(data)
  hash.update(path.relative(process.cwd(), outputNSFilePath))
  return hash.digest('hex')
}
