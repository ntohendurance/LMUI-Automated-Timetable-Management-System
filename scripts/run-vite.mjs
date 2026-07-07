// ---------------------------------------------------------------------------
// Cross-shell Vite launcher for LMUI E-Timetable.
//
// This project lives under a path that contains a space ("BTECH DEFENSE").
// On Windows, Node's child_process.spawn() fails with `spawn UNKNOWN` when it
// tries to launch esbuild.exe from inside a spaced path — even though the
// binary itself is perfectly fine. Vite/esbuild spawn the esbuild service this
// way, so `vite dev` / `vite build` break.
//
// Fix: stage a copy of the matching esbuild.exe in a space-free directory under
// the user's home folder and point ESBUILD_BINARY_PATH at it before Vite loads.
// This keeps `npm run dev` / `npm run build` working with zero manual steps.
// ---------------------------------------------------------------------------
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { homedir, platform } from 'node:os'
import { existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

function stageEsbuildIfNeeded() {
  if (platform() !== 'win32') return
  const src = join(projectRoot, 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe')
  if (!existsSync(src)) return // nothing to stage (non-win64 install)

  // Only stage if our own path contains a space (the trigger for the bug).
  if (!projectRoot.includes(' ')) return

  const stageDir = join(homedir(), '.lmui-esbuild')
  const dst = join(stageDir, 'esbuild.exe')
  try {
    mkdirSync(stageDir, { recursive: true })
    const needCopy =
      !existsSync(dst) || statSync(dst).size !== statSync(src).size
    if (needCopy) copyFileSync(src, dst)
    process.env.ESBUILD_BINARY_PATH = dst
  } catch (err) {
    console.warn('[run-vite] Could not stage esbuild binary:', err.message)
  }
}

stageEsbuildIfNeeded()

// Hand off to the Vite CLI with whatever args were passed (dev / build / preview).
// Import by absolute file path — the "vite/bin/vite.js" subpath isn't exported.
const viteCli = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
await import(pathToFileURL(viteCli).href)
