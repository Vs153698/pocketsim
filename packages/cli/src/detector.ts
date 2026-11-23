import fs from 'node:fs';
import path from 'node:path';

export interface ProjectInfo {
  isReactNative: boolean;
  isExpo: boolean;
  packageManager: 'pnpm' | 'yarn' | 'bun' | 'npm';
  projectName: string;
  projectPath: string;
  dependencies: Record<string, string>;
  metroPort: number;
  entryPoint: string;
}

export function detectProject(targetDir: string = process.cwd()): ProjectInfo {
  const pkgPath = path.join(targetDir, 'package.json');
  let pkg: any = {};
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch {
      // Ignored
    }
  }

  const allDeps: Record<string, string> = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {})
  };

  const isExpo = Boolean(allDeps['expo'] || fs.existsSync(path.join(targetDir, 'app.json')));
  const isReactNative = Boolean(allDeps['react-native'] || isExpo);

  let packageManager: ProjectInfo['packageManager'] = 'npm';
  let currDir = targetDir;
  while (currDir && currDir !== path.dirname(currDir)) {
    if (fs.existsSync(path.join(currDir, 'pnpm-lock.yaml')) || fs.existsSync(path.join(currDir, 'pnpm-workspace.yaml'))) {
      packageManager = 'pnpm';
      break;
    } else if (fs.existsSync(path.join(currDir, 'yarn.lock'))) {
      packageManager = 'yarn';
      break;
    } else if (fs.existsSync(path.join(currDir, 'bun.lockb'))) {
      packageManager = 'bun';
      break;
    }
    currDir = path.dirname(currDir);
  }

  let entryPoint = 'index';
  if (isExpo && fs.existsSync(path.join(targetDir, 'App.tsx'))) {
    entryPoint = 'App';
  } else if (fs.existsSync(path.join(targetDir, 'src/App.tsx'))) {
    entryPoint = 'src/App';
  }

  return {
    isReactNative,
    isExpo,
    packageManager,
    projectName: pkg.name || path.basename(targetDir),
    projectPath: targetDir,
    dependencies: allDeps,
    metroPort: 8081,
    entryPoint
  };
}
