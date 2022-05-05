import { readFile } from 'fs/promises'
import { join } from 'path'

export async function getFixture(file: string): Promise<string> {
  const filepath = file.includes('fixtures') ? file : join(process.cwd(), 'test/fixtures', file)

  const content = await readFile(filepath, 'utf-8')
  return content
}
