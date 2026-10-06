#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '..', 'src', 'mcp', 'server.ts');

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsx', serverPath, ...process.argv.slice(2)],
  { stdio: 'inherit' }
);

child.on('exit', (code) => {
  process.exit(code || 0);
});
