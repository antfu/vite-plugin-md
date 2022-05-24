import { join } from 'path'

export const importFixture = async (fixture: string) => {
  const file = fixture = join(process.cwd(), 'test/fixtures', fixture.endsWith('.md')
    ? fixture
    : `${fixture}.md`)

  const Component = await import(file)
  return Component
}
