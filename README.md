# Chad

Chad is the programming language for chads!

## Transpiler

Chad transpiles code into multiple languages simultaneously.

```ts
const compiler = new Compiler(fs.readFileSync('giga.chad', 'utf-8'))
const compiled = compiler.compile()
for (const [key, value] of Object.entries(compiled)) {
  fs.writeFileSync(`test/main.${key}`, value)
}
```

It can currently transpile to these languages:
- TypeScript
- Python