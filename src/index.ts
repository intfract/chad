import * as fs from 'fs'

class Compiler {
  i: number = 0
  end: boolean = false
  code: string
  char: string

  digits: string = '.0123456789'
  letters: string = 'qwertyuiopasdfghjklzxcvbnm'
  assignment: string[] = ['var', 'const']
  blocks: string[] = ['while']
  symbols: string = ':<=>-+'
  operators: string[] = ['<-', '->', '=', '<', '>', '<=', '=>', ':', '-', '+']
  formatting: string = ' \t'
  separator: string = ','
  stoppers: string = ';\n'

  maps: Record<string, Record<string, string>> = {
    'ts': {
      '<-': '=',
      '=': '==',
      'var': 'let',
      'int': 'number',
      'double': 'number',
    },
    'py': {
      '<-': '=',
      '=': '==',
      ';': '\n'
    },
  }

  ts: string = ''
  py: string = ''

  constructor(code: string) {
    this.code = code
    this.char = this.code[this.i]
  }

  move() {
    this.i++
    if (this.i < this.code.length) return this.char = this.code[this.i]
    this.end = true
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
    while (!this.end) {
      if (this.formatting.includes(this.char)) {
        this.ts += ' '
        this.py += ' '
        this.ts = this.ts.trimStart()
        this.py = this.py.trimStart()
        this.skipBlanks()
        continue
      }
      if (this.digits.includes(this.char)) {
        const number = this.extractNumber()
        this.ts += number
        this.py += number
      }
      if (this.isLetter(this.char)) {
        const word = this.extractWord()
        if (this.assignment.includes(word)) {
          // python does not use declaration keywords
        } else if (this.blocks.includes(word)) {
          this.py += word
        } else {
          this.py += word
        }
        if (Object.keys(this.maps.ts).includes(word)) {
          this.ts += this.maps.ts[word]
        } else {
          this.ts += word
        }
        continue
      }
      if (this.stoppers.includes(this.char)) {
        this.ts += ';'
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
      this.move()
    }
    return {
      ts: this.ts,
      py: this.py,
    }
  }
}

const compiler = new Compiler(fs.readFileSync('giga.chad', 'utf-8'))
const compiled = compiler.compile()
console.log(compiled)