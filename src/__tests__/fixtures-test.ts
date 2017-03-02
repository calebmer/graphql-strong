import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2015,
  noEmit: true,
  noImplicitAny: true,
  strictNullChecks: true,
  include: [path.resolve(__dirname, '../../src')],
};

const fixturesDir = path.resolve(__dirname, 'fixtures');
const fixtureNames = fs.readdirSync(fixturesDir);
const fixtureFileNames = fixtureNames.map(name => path.resolve(fixturesDir, name));
const fixtureFiles = fixtureFileNames.map(fileName => fs.readFileSync(fileName, 'utf8'));
const program = ts.createProgram(fixtureFileNames, compilerOptions);
const emitResult = program.emit();
const allDiagnostics = [...ts.getPreEmitDiagnostics(program), ...emitResult.diagnostics];

fixtureNames.forEach((name, i) => {
  test(name, () => {
    const diagnostics = allDiagnostics
      .filter(({ file }) => file.fileName === fixtureFileNames[i])
      .map(({ file, ...diagnostic }) => ({
        ...diagnostic,
        text: file.text.slice(diagnostic.start, diagnostic.start + diagnostic.length),
      }));
    expect(diagnostics).toMatchSnapshot();
  });
});
