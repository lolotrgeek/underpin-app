
//
// Constants

import { Actor } from "../shared/types"

//
const API_URL = 'http://localhost:4000/api'
const WS_URL = 'ws://localhost:4000/api/events'
const TOKEN_KEY = 'token'

//
// token persistent storage
//
export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || ''
export const setToken = (value: string) => sessionStorage.setItem(TOKEN_KEY, value)
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY)

//
// Shared fetch wrapper funcs
//

const httpGet = async (path: string) => {
  const url = `${API_URL}/${path}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // add the token from localStorage into every request
      'X-Token': getToken(),
    },
  })
  const json = await response.json()
  if (json.error) {
    throw new Error(json.error)
  }
  return json
}

const httpPost = async (path: string, data: Record<string, any> = {}) => {
  const url = `${API_URL}/${path}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // add the token from localStorage into every request
      'X-Token': getToken(),
    },
    body: JSON.stringify(data),
  })
  const json = await response.json()
  if (json.error) {
    throw new Error(json.error)
  }
  return json
}

//
// Exported API functions
//

// open a WebSocket connection to the server
export const getEventsSocket = () => {
  return new WebSocket(WS_URL)
}

export const connect = async (host: string, cert: string, macaroon: string) => {
  const request = { host, cert, macaroon }
  const { token } = await httpPost('connect', request)
  // save the token into the browser's storage
  setToken(token)
}

export const getInfo = async () => {
  return await httpGet('info')
}

export const fetchActors = async () => {
  return await httpGet('actors')
}

export const createActor = async (name:string) => {
  const request = { name }
  return await httpPost('actors', request)
}

// do we need this? or can we auto create when we do a txn?
export const createInvoice = async (actor:string) => {
  return await httpPost(`actors/${actor}/invoice`)
}

export const assignImpact = async (actorId:number, hash: string) => {
  // TODO: should send state / action to the backend so it can calc the impact
  const request = { hash }
  return await httpPost(`actors/${actorId}/impact`, request)
}

export const verifyActor = async (actorId:number) => {
  return await httpPost(`actors/${actorId}/verify`)
}
