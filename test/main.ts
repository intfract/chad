import * as fs from 'fs'

function output(message: any) {
  console.log(message)
  return message
}

function read(path: string) {
  return fs.readFileSync(path, 'utf-8')
}

function write(path: string, text: string) {
  fs.writeFileSync(path, text)
  return text
}

// ts
let x:number=0;let y:string="Hello, world!";while (x<4){x=x+1;output(x);}