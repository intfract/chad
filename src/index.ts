import * as fs from 'fs'

class Compiler {
  i: number = 0
  end: boolean = false
  code: string
  char: string

  digits: string = '.0123456789'
  letters: string = 'qwertyuiopasdfghjklzxcvbnm'
  assignment: string[] = ['var', 'const']
  blocks: string[] = ['while', 'func']
  symbols: string = ':<=>+-*/&|!'
  operators: string[] = ['<-', '->', '=', '<', '>', '<=', '=>', ':', '+', '-', '*', '/', '&&', '||', '!']
  formatting: string = ' \t'
  separator: string = ','
  stoppers: string = ';\n'
  quotes: string = '"'
  brackets: string = '()[]{}'

  maps: Record<string, Record<string, string>> = {
    ts: {
      '<-': '=',
      '=': '==',
      'var': 'let',
      'int': 'number',
      'double': 'number',
      'func': 'function',
    },
    py: {
      '<-': '=',
      '=': '==',
      ';': '\n',
      '&&': ' and ',
      '||': ' or ',
      '!': ' not ',
      'string': 'str',
      'func': 'def',
    },
  }

  ts: string = ''
  py: string = ''

  io: Record<string, string>

  constructor(code: string, io: Record<string, string>) {
    this.code = code
    this.char = this.code[this.i]
    this.io = io
  }

  move() {
    this.i++
    if (this.i < this.code.length) return this.char = this.code[this.i]
    this.end = true
  }

  substitute(term: string, language: string) {
    if (Object.keys(this.maps[language]).includes(term)) {
      this[language] += this.maps[language][term]
    } else {
      this[language] += term
    }
  }

  addToAll(term: string, languages: string[]) {
    for (const language of languages) {
      this[language] += term
    }
  }

  isLetter(char: string): boolean {
    return this.letters.includes(char.toLowerCase())
  }

  extractNumber(): string {
    let s = ''
    let dp = 0
    while (!this.end && this.digits.includes(this.char)) {
      if (this.char === '.') dp++
      if (dp > 1) throw new Error('too many decimal points in number')
      s += this.char
      this.move()
    }
    return s
  }

  extractWord(): string {
    let s = ''
    while (!this.end && this.isLetter(this.char)) {
      s += this.char
      this.move()
    }
    return s
  }

  extractQuote(quote: string): string {
    let s = ''
    while (!this.end && this.char !== quote) {
      s += this.char
      this.move()
    }
    return s
  }

  extractOperator(): string {
    let s = ''
    while (!this.end && this.symbols.includes(this.char)) {
      s += this.char
      this.move()
    }
    return s
  }

  skipBlanks() {
    while (!this.end && this.formatting.includes(this.char)) {
      this.move()
    }
  }

  compile(): Record<string, string> {
    let temp: string
    let indent: number = 0
    while (!this.end) {
      if (this.py.at(-1) === '\n') this.py += '\t'.repeat(indent)
      if (this.brackets.includes(this.char)) {
        if ('()[]'.includes(this.char)) {
          this.addToAll(this.char, ['ts', 'py'])
        } else {
          this.ts += this.char
          if (this.char === '{') {
            this.py += ':'
            indent++
          }
        }
        this.move()
        continue
      }
      if (this.formatting.includes(this.char)) {
        // this.ts += ' '
        // if (!this.assignment.includes(temp)) this.py += ' '
        this.skipBlanks()
        continue
      }
      if (this.stoppers.includes(this.char)) {
        const prev = this.code[this.i - 1]
        if (prev === this.char) throw new Error('unexpected end of line')
        if (!this.stoppers.includes(prev)) {
          if (prev !== '{') this.ts += ';'
          this.py += '\n'
        }
        this.move()
        continue
      }
      if (this.digits.includes(this.char)) {
        const number = this.extractNumber()
        this.ts += number
        this.py += number
      }
      if (this.isLetter(this.char)) {
        const word = this.extractWord()
        this.substitute(word, 'ts')
        if (this.assignment.includes(word)) {
          this.ts += ' '
        } else {
          this.substitute(word, 'py')
          if (this.blocks.includes(word)) {
            this.addToAll(' ', ['ts', 'py'])
          }
        }
        temp = word
        continue
      }
      if (this.symbols.includes(this.char)) {
        const operator = this.extractOperator()
        if (!this.operators.includes(operator)) throw new Error(`"${operator}" is an invalid operator`)
        if (Object.keys(this.maps.ts).includes(operator)) {
          const op = this.maps.ts[operator]
          this.ts += op
        } else {
          this.ts += operator
        }
        if (Object.keys(this.maps.py).includes(operator)) {
          const op = this.maps.py[operator]
          this.py += op
        } else {
          this.py += operator
        }
        continue
      }
      if (this.quotes.includes(this.char)) {
        const quote = this.char
        this.move()
        const text = this.extractQuote(quote)
        this.addToAll(quote + text + quote, ['ts', 'py'])
        this.move()
        continue
      }
    }
    let o: Record<string, string> = {}
    let comment: string
    for (const [key, value] of Object.entries(this.io)) {
      if (key === 'ts') comment = '//'
      else if (key === 'py') comment = '#'
      o[key] = `${value}\n\n${comment + ' ' + key}\n${this[key]}`
    }
    return o
  }
}

const compiler = new Compiler(fs.readFileSync('giga.chad', 'utf-8'), {
  ts: fs.readFileSync('scripts/io.ts', 'utf-8'),
  py: fs.readFileSync('scripts/io.py', 'utf-8'),
})
const compiled = compiler.compile()
console.log(compiled)
for (const [key, value] of Object.entries(compiled)) {
  fs.writeFileSync(`test/main.${key}`, value)
}