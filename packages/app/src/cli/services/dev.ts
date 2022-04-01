import {ensureDevEnvironment} from './dev/environment'
import {updateURLs} from './dev/update-urls'
import {createTunnel} from './dev/tunnel'
import {App, Home} from '../models/app/app'
import {output, system} from '@shopify/cli-kit'

interface DevOptions {
  app: App
}

interface DevHomeOptions {
  port: number
  apiKey: string
  apiSecret: string
  hostname: string
}

async function dev({app}: DevOptions) {
  const {
    app: {apiKey, apiSecretKeys},
    store,
  } = await ensureDevEnvironment(app)
  const port = 3000
  const url = await createTunnel({port})
  await updateURLs(apiKey, url)
  output.success(`Your app is available at: ${url}/auth?shop=${store.shopDomain}`)
  devHome(app.home, {
    apiKey,
    apiSecret: apiSecretKeys[0].secret,
    hostname: url,
    port,
  })
}

async function devHome(home: Home, options: DevHomeOptions) {
  const script = home.configuration.commands.dev
  if (!script) {
    return
  }

  const [cmd, ...args] = script.split(' ')

  await output.concurrent(0, 'home', async (stdout) => {
    await system.exec(cmd, args, {
      cwd: home.directory,
      stdout,
      env: {
        ...process.env,
        SHOPIFY_API_KEY: options.apiKey,
        SHOPIFY_API_SECRET: options.apiSecret,
        HOST: options.hostname,
        SCOPES: 'write_products,write_customers,write_draft_orders',
        PORT: `${options.port}`,
        NODE_ENV: `development`,
      },
    })
  })
}

export default dev
