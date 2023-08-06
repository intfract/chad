import * as fs from 'fs'

class Compiler {
  i: number = 0
  end: boolean = false
  code: string
  char: string

  assignment: ['var', 'const']
  blocks: ['while']

  ts: string = ''

  constructor(code: string) {
    this.code = code
    this.char = this.code[this.i]
  }

  move() {
    this.i++
    if (this.i < this.code.length) return this.char = this.code[this.i]
    this.end = true
  }

  compile() {
    while (!this.end) {
      this.move()
    }
  }
}

const compiler = new Compiler(fs.readFileSync('giga.chad', 'utf-8'))
compiler.compile()