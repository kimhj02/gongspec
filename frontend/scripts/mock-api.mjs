import { randomUUID } from 'node:crypto'
import http from 'node:http'

const store = {
  resources: [],
  schedules: [],
}

const cors = {
  'Access-Control-Allow-Origin': 'http://localhost:13001',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

const mockUser = {
  id: 'user-mock',
  kakaoId: 'kakao-mock',
  nickname: '공스펙',
  email: 'mock@example.com',
  createdAt: new Date().toISOString(),
}

function send(res, status, body, extra = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...cors,
    ...extra,
  })
  res.end(body === undefined ? '' : JSON.stringify(body))
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        const key = index < 0 ? part : part.slice(0, index)
        const value = index < 0 ? '' : part.slice(index + 1)
        return [key, decodeURIComponent(value)]
      }),
  )
}

function requireUser(req, res) {
  if (parseCookies(req).gongspec_token !== 'mock-session') {
    send(res, 401, { message: '로그인이 필요합니다.' })
    return false
  }
  return true
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (error) {
        reject(error)
      }
    })
  })
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}`
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204)
    return
  }

  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const resourceMatch = url.pathname.match(/^\/api\/resources\/([^/]+)$/)
  const scheduleMatch = url.pathname.match(/^\/api\/schedules\/([^/]+)$/)

  try {
    if (req.method === 'GET' && url.pathname === '/api/auth/kakao/url') {
      const state = randomUUID()
      send(res, 200, { url: `/auth/kakao/callback?code=mock-code&state=${state}` }, {
        'Set-Cookie': cookie('gongspec_oauth_state', state, 600),
      })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/kakao/callback') {
      const body = await readBody(req)
      const stateCookie = parseCookies(req).gongspec_oauth_state
      if (!body.code || !body.state || !stateCookie || stateCookie !== body.state) {
        send(res, 401, { message: '카카오 로그인에 실패했습니다.' })
        return
      }
      send(res, 200, mockUser, {
        'Set-Cookie': [cookie('gongspec_token', 'mock-session', 60 * 60 * 24 * 7), cookie('gongspec_oauth_state', '', 0)],
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      if (!requireUser(req, res)) return
      send(res, 200, mockUser)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      send(res, 204, undefined, { 'Set-Cookie': cookie('gongspec_token', '', 0) })
      return
    }

    if (!requireUser(req, res)) return

    if (req.method === 'GET' && url.pathname === '/api/resources') {
      const tab = url.searchParams.get('tab')
      const query = (url.searchParams.get('query') ?? '').toLowerCase()
      const items = store.resources.filter((item) => {
        const matchesTab = !tab || item.tab === tab
        const haystack = `${item.title} ${item.subtitle} ${item.body} ${Object.values(item.details ?? {}).join(' ')}`.toLowerCase()
        return matchesTab && (!query || haystack.includes(query))
      })
      send(res, 200, items)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/resources') {
      const body = await readBody(req)
      const created = { id: nextId('res'), pinned: false, ...body }
      store.resources.unshift(created)
      send(res, 201, created)
      return
    }

    if (req.method === 'PUT' && resourceMatch) {
      const body = await readBody(req)
      const index = store.resources.findIndex((item) => item.id === resourceMatch[1])
      if (index < 0) {
        send(res, 404, { message: '자료를 찾을 수 없습니다.' })
        return
      }
      store.resources[index] = { ...store.resources[index], ...body }
      send(res, 200, store.resources[index])
      return
    }

    if (req.method === 'DELETE' && resourceMatch) {
      store.resources = store.resources.filter((item) => item.id !== resourceMatch[1])
      send(res, 204)
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/schedules') {
      send(res, 200, store.schedules)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/schedules') {
      const body = await readBody(req)
      const created = { id: nextId('sch'), ...body }
      store.schedules.push(created)
      send(res, 201, created)
      return
    }

    if (req.method === 'PUT' && scheduleMatch) {
      const body = await readBody(req)
      const index = store.schedules.findIndex((item) => item.id === scheduleMatch[1])
      if (index < 0) {
        send(res, 404, { message: '일정을 찾을 수 없습니다.' })
        return
      }
      const updated = { ...body, id: scheduleMatch[1] }
      store.schedules[index] = updated
      send(res, 200, updated)
      return
    }

    if (req.method === 'DELETE' && scheduleMatch) {
      store.schedules = store.schedules.filter((item) => item.id !== scheduleMatch[1])
      send(res, 204)
      return
    }

    send(res, 404, { message: '없는 API입니다.' })
  } catch {
    send(res, 500, { message: 'mock api 오류' })
  }
})

const port = Number(process.env.PORT || 8080)
server.listen(port, () => {
  console.log(`mock api listening on ${port}`)
})
