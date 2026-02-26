#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const websiteRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(websiteRoot, '..');
const sourceRoot = path.join(repoRoot, 'specification', 'docs');
const targetRoot = path.join(websiteRoot, 'docs');
const managedDirs = ['specification', 'integration-guides', 'examples'];
const checkMode = process.argv.includes('--check');

async function collectDocs(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectDocs(fullPath, base)));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      files.push(path.relative(base, fullPath));
    }
  }

  return files.sort();
}

async function run() {
  const sourceFiles = [];
  for (const dir of managedDirs) {
    const fullDir = path.join(sourceRoot, dir);
    sourceFiles.push(...(await collectDocs(fullDir, sourceRoot)));
  }

  const mismatches = [];
  let writes = 0;

  for (const relPath of sourceFiles) {
    const sourcePath = path.join(sourceRoot, relPath);
    const targetPath = path.join(targetRoot, relPath);

    const sourceContent = await fs.readFile(sourcePath, 'utf8');
    let targetContent = null;

    try {
      targetContent = await fs.readFile(targetPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    if (targetContent === sourceContent) {
      continue;
    }

    if (checkMode) {
      mismatches.push(relPath);
      continue;
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, sourceContent, 'utf8');
    writes += 1;
  }

  if (checkMode && mismatches.length > 0) {
    console.error('Docs are out of sync. Run `npm run sync:docs` in website/.');
    for (const relPath of mismatches) {
      console.error(`- ${relPath}`);
    }
    process.exit(1);
  }

  if (checkMode) {
    console.log(`Docs are in sync (${sourceFiles.length} checked files).`);
    return;
  }

  console.log(`Synced ${writes} file(s) from specification/docs -> website/docs.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
