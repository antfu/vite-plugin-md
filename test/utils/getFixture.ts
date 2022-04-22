import { readFile } from 'fs/promises'

export async function getFixture(file: string): Promise<string> {
  const content = await readFile(`test/fixtures/${file}`, 'utf-8')
  return content
}
