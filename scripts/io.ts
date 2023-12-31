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