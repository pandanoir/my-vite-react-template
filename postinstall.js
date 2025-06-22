import { readFile, writeFile, rm } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

// 依存関係をlatestに更新する
const updateDepsToLatest = async () => {
  const packageJson = JSON.parse(await readFile(resolve(__dirname, 'package.json'), 'utf8'));
  const deps = [...Object.keys(packageJson.dependencies || {}),...Object.keys(packageJson.devDependencies || {})];
  if (deps.length > 0)
    await execAsync(`npm install ${deps.map((d) => `${d}@latest`).join(' ')} --save-exact`, { stdio: 'inherit' });
};
const removePostinstall = async () => {
  // package.jsonのスクリプトからpostinstallを削除
  const packageJson = JSON.parse(await readFile(resolve(__dirname, 'package.json'), 'utf8'));
  if (packageJson.scripts?.postinstall === 'node postinstall.js') {
    delete packageJson.scripts.postinstall;
    await writeFile(resolve(__dirname, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
  }

  // postinstall.js を削除
  await rm(resolve(__dirname, 'postinstall.js'));
};
await updateDepsToLatest();
await removePostinstall();

