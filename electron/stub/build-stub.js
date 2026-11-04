const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const stubCs = path.join(__dirname, 'StubRunner.cs');
const stubExe = path.join(__dirname, 'StubRunner.exe');

const candidateCompilers = [
  'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe',
  'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe'
];

let compilerPath = candidateCompilers.find(p => fs.existsSync(p));

if (!compilerPath) {
  console.error('[XQuest] .NET csc.exe compiler not found in standard paths.');
  process.exit(1);
}

console.log(`[XQuest] Compiling StubRunner with ${compilerPath}...`);

try {
  execFileSync(compilerPath, [
    '/target:winexe',
    '/optimize+',
    `/out:${stubExe}`,
    stubCs
  ], { stdio: 'inherit' });

  if (fs.existsSync(stubExe)) {
    const stats = fs.statSync(stubExe);
    console.log(`[XQuest] StubRunner.exe compiled successfully! Size: ${(stats.size / 1024).toFixed(1)} KB`);

    // Also copy to dist-electron/stub if dist-electron exists
    const distStubDir = path.join(__dirname, '..', '..', 'dist-electron', 'stub');
    try {
      if (!fs.existsSync(distStubDir)) {
        fs.mkdirSync(distStubDir, { recursive: true });
      }
      fs.copyFileSync(stubExe, path.join(distStubDir, 'StubRunner.exe'));
    } catch {}
  }
} catch (err) {
  console.error('[XQuest] Compilation failed:', err);
  process.exit(1);
}
