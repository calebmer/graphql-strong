import * as path from 'path'
import * as fs from 'fs'
import * as ts from 'typescript'

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2015,
  noEmit: true,
  noImplicitAny: true,
  strictNullChecks: true,
  include: [path.resolve(__dirname, '../../src')]
}

const fixturesDir = path.resolve(__dirname, 'fixtures')

fs.readdirSync(fixturesDir).forEach(name => {
  test(name, () => {
    const fixtureFileName = path.join(fixturesDir, name)
    const program = ts.createProgram([fixtureFileName], compilerOptions)
    const emitResult = program.emit()
    const allDiagnostics = [...ts.getPreEmitDiagnostics(program), ...emitResult.diagnostics]
    expect(allDiagnostics.map(({ file, ...rest }) => rest)).toMatchSnapshot()
  })
})
