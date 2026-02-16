export async function isQueueReady() {
  const net = await import('node:net')
  const { serverConfig } = await import('../config/env')

  return await new Promise<boolean>((resolve) => {
    const url = new URL(serverConfig.redisUrl)
    const socket = net.createConnection({
      host: url.hostname,
      port: url.port ? Number.parseInt(url.port, 10) : 6379,
    })

    const done = (value: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(value)
    }

    socket.setTimeout(800)
    socket.once('connect', () => done(true))
    socket.once('error', () => done(false))
    socket.once('timeout', () => done(false))
  })
}
