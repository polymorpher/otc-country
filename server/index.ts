import express, { type NextFunction, type Request, type Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import pool from './pg.js'
import { getAssetByAddress } from '../app/src/helpers/assets.js'
import createError from 'http-errors'
import fs from 'fs'
import https from 'https'
import http from 'http'
import compression from 'compression'
import type { AddressInfo } from 'net'
import logger from 'morgan'

// configures dotenv to work in your application
dotenv.config()

const app = express()

const PORT = process.env.PORT
const HTTPS_PORT = process.env.HTTPS_PORT
const DEBUG = process.env.DEBUG
const HTTPS_KEY = process.env.HTTPS_KEY ?? './certs/privkey.pem'
const HTTPS_CERT = process.env.HTTPS_CERT ?? './certs/fullchain.pem'

const httpsOptions = {
  key: fs.readFileSync(HTTPS_KEY, { encoding: 'utf-8' }),
  cert: fs.readFileSync(HTTPS_CERT, { encoding: 'utf-8' })
}

const httpServer = http.createServer(app)
const httpsServer = https.createServer(httpsOptions, app)

app.set('trust proxy', true)
app.use(cors())
app.use(compression())

app.use(logger('dev'))

app.options('*', async (_req, res) => {
  res.end()
})
app.get('/health', async (request: Request, response: Response) => {
  response.send('OK').end()
})

app.get('/', async (request: Request, response: Response) => {
  const { asset, age } = request.query
  const page = Number(request.query.page ?? 0)
  const pageSize = Number(request.query.pageSize ?? 10)

  const where = ['TRUE']; const args = []

  if (asset !== undefined) {
    if (!getAssetByAddress(String(asset))) {
      return response.status(400).header('content-type', 'application/json').send('invalid asset')
    }

    where.push('(src_asset = $ OR dest_asset = $)')
    args.push(asset)
    args.push(asset)
  }

  if (age !== undefined) {
    // age in hour
    where.push('time >= $')
    args.push(new Date(Date.now() - Number(age) * 3600 * 1000).toISOString())
  }

  args.push(pageSize * page)
  args.push(pageSize)

  let cnt = 1

  const query = `
    SELECT *
    FROM logs
    WHERE ${where.join(' AND ')}
    ORDER BY time DESC
    OFFSET $
    LIMIT $
  `.replace(/\$/g, () => `$${cnt++}`)

  try {
    const res = await pool.query(query, args)
    return response.status(200).header('content-type', 'application/json').send(res.rows)
  } catch (ex) {
    console.error(ex)
    return response.status(500).send('{"error":"Internal Server Error"}')
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = DEBUG ? err : {}

  // render the error page
  res.status(err.status ?? 500)
  res.json({ error: res.locals.error, message: err.message })
})

httpsServer.listen(HTTPS_PORT ?? 8443, () => {
  const { port, address } = httpsServer.address() as AddressInfo
  console.log(`HTTPS server listening on port ${port} at ${address}`)
}).on('error', (error) => {
  throw new Error(error.message)
})

httpServer.listen(PORT ?? 3000, () => {
  const { port, address } = httpServer.address() as AddressInfo
  console.log(`HTTP server listening on port ${port} at ${address}`)
}).on('error', (error) => {
  throw new Error(error.message)
})
