import { readFile } from 'fs/promises'
import { join } from 'path'

export async function getFixture(file: string): Promise<string> {
  const filepath = file.includes('fixtures')
    ? file.endsWith('.md') ? file : `${file}.md`
    : join(process.cwd(), 'test/fixtures', file.endsWith('.md') ? file : `${file}.md`)

  try {
    const content = await readFile(filepath, 'utf-8')

    return content
  }
  catch (err) {
    throw new Error(`Problem loading the Markdown fixture: ${filepath}!\n\n${err instanceof Error ? err.message : String(err)}`)
  }
}
