import { readFile } from 'fs/promises'

export async function getFixture(file: string): Promise<string> {
  file = `test/fixtures/${file}`
  try {
    return await readFile(file, 'utf-8')
  } catch (e) {
    throw new Error(`Problem loading fixture: "${file}". Error message: ${e instanceof Error ? e.message : String(e)}`)
  }
}
