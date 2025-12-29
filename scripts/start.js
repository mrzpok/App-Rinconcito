#!/usr/bin/env node
import { spawn } from 'node:child_process'
import net from 'node:net'

const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

async function isPortFree(port, host = HOST) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, host)
  })
}

async function findAvailablePort(startPort) {
  let candidate = startPort
  const maxAttempts = 20

  for (let i = 0; i < maxAttempts; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(candidate)
    if (free) return candidate
    candidate += 1
  }

  throw new Error(
    `No se encontraron puertos libres entre ${startPort} y ${startPort + maxAttempts}`
  )
}

async function main() {
  const desiredPort = DEFAULT_PORT
  let portToUse = desiredPort

  try {
    portToUse = await findAvailablePort(desiredPort)
    if (portToUse !== desiredPort) {
      console.warn(
        `⚠️  El puerto ${desiredPort} está en uso. Iniciando en el puerto ${portToUse}. ` +
          'Si deseas forzar un puerto distinto, ejecuta: PORT=#### npm start'
      )
    }
  } catch (err) {
    console.error('No se pudo encontrar un puerto libre para iniciar la app.')
    console.error(err)
    process.exit(1)
  }

  const child = spawn('npx', ['next', 'start', '-H', HOST, '-p', String(portToUse)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(portToUse) },
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

main()
