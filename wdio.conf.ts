// https://v2.tauri.app/develop/tests/webdriver/example/webdriverio/
import type { ChildProcess } from 'node:child_process'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// keep track of the `tauri-driver` child process
let tauriDriver: ChildProcess
let exit = false

export const config = {
  afterSession: () => {
    closeTauriDriver()
  },
  // ensure `tauri-driver` so webdriver requests are proxied
  beforeSession: () => {
    tauriDriver = spawn(
      path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process.stderr] },
    )

    tauriDriver.on('error', (error) => {
      console.error('tauri-driver error:', error)
      process.exit(1)
    })
    tauriDriver.on('exit', (code) => {
      if (!exit) {
        console.error('tauri-driver exited with code:', code)
        process.exit(1)
      }
    })
  },
  capabilities: [
    {
      'maxInstances': 1,
      'tauri:options': {
        application: resolveAppBinaryPath(),
      },
    },
  ],
  framework: 'mocha',
  host: '127.0.0.1',
  maxInstances: 1,
  mochaOpts: {
    timeout: 60000,
    ui: 'bdd',
  },
  // build for webdriver sessions
  onPrepare: () => {
    spawnSync(
      'bun',
      ['run', 'tauri', 'build', '--debug', '--no-bundle'],
      {
        cwd: __dirname,
        shell: true,
        stdio: 'inherit',
      },
    )
  },
  port: 4444,
  reporters: ['spec'],
  specs: ['./test/e2e/**/*.ts'],
}

function closeTauriDriver() {
  exit = true
  tauriDriver?.kill()
}

function resolveAppBinaryPath() {
  const release = path.resolve(__dirname, 'src-tauri', 'target', 'release', 'swim')
  const debug = path.resolve(__dirname, 'src-tauri', 'target', 'debug', 'swim')
  const preferred = debug
  const fallback = release

  if (existsSync(preferred))
    return preferred

  if (existsSync(fallback))
    return fallback

  // on first run this can be called before `onPrepare` builds; default to selected target
  return preferred
}

function onShutdown(fn) {
  const cleanup = () => {
    try {
      fn()
    }
    finally {
      process.exit()
    }
  }

  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('SIGHUP', cleanup)
  process.on('SIGBREAK', cleanup)
}

// ensure `tauri-driver` is closed when test process exits
onShutdown(() => {
  closeTauriDriver()
})
