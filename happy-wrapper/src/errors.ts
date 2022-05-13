import { relative } from 'path'
import callsites from 'callsites'
import { inspect } from './diagnostics'
import { isHappyWrapperError, isInspectionTuple } from './type-guards'

export interface StackLine {
  fn: string | undefined
  line: number | undefined
  file: string | undefined
}

export class HappyMishap extends Error {
  public name = 'HappyWrapper'
  public readonly kind: 'HappyWrapper' = 'HappyWrapper'
  public trace: string[] = []
  public readonly line: number | null
  public readonly fn: string
  public readonly file: string
  public readonly structuredStack: StackLine[]
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
    }
  }

  public toString() {
    return {
      name: this.name,
      message: this.message,
    }
  }

  constructor(
    message: string,
    options: {
      error?: unknown
      inspect?: unknown
      name?: string
    } = {}) {
    super()
    this.message = `\n${message}`
    if (options.name)
      this.name = `HappyWrapper::${options.name || 'unknown'}`

    try {
      const sites = callsites()
      this.structuredStack = (sites || []).slice(1).map((i) => {
        return {
          fn: i.getFunctionName() || i.getMethodName() || i.getFunction()?.name || '',
          line: i.getLineNumber() || undefined,
          file: i.getFileName() ? relative(process.cwd(), i.getFileName() as string) : '',
        }
      })
      || []
    }
    catch {
      this.structuredStack = []
    }

    this.fn = this.structuredStack[0].fn || ''
    this.file = this.structuredStack[0].file || ''
    this.line = this.structuredStack[0].line || null

    // proxy if already a HappyWrapper
    if (isHappyWrapperError(options.error))
      this.name = `[file: ${this.file}, line: ${this.line}] HappyWrapper::${options.name || options.error.name}`

    if (options.error) {
      const name = options.error instanceof Error
        ? options.error.name.replace('HappyWrapper::', '')
        : 'unknown'
      const underlying = `\n\nThe underlying error message [${name}] was:\n${options.error instanceof Error ? options.error.message : String(options.error)}`
      this.message = `${this.message}${underlying}`
      this.trace = [...this.trace, name]
    }
    else {
      if (options.inspect) {
        const inspections = isInspectionTuple(options.inspect)
          ? [options.inspect]
          : Array.isArray(options.inspect)
            ? options.inspect
            : [options.inspect]

        inspections.forEach((i, idx) => {
          const intro = isInspectionTuple(i) ? `${i[0]}\n` : `${[idx]}:\n`
          const container = isInspectionTuple(i) ? i[1] : i

          this.message = `${this.message}\n\n${intro}${JSON.stringify(inspect(container), null, 2)}`
        })
      }
      if (this.trace.length > 1)
        this.message = `${this.message}\n\nTrace:${this.trace.map((i, idx) => `${idx}. ${i}`)}`
    }

    this.message = `${this.message}\n`
    this.structuredStack.forEach(
      (l) => {
        this.message = l.file?.includes('.pnpm')
          ? this.message
          : `${this.message}\n  - ${l.fn ? `${l.fn}() ` : ''}${l.file}:${l.line}`
      },
    )
  }
}
