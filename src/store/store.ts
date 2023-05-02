import { makeAutoObservable } from 'mobx'
import * as api from '../app/api'
import { Actor, SocketEvents } from '../shared/types'

export class Store {
  constructor() {
    makeAutoObservable(this)

    this.init()
  }

  //
  // Observable state objects
  //
  
  // App state
  page = 'actors'
  error = ''
  connected = false
  alias = ''
  balance = 0
  pubkey = ''
  makeItRain = false

  // Actor List state
  actors: Actor[] = []

  // PayModal state
  showPayModal = false
  pmtForActor: Actor | undefined
  pmtAmount = ''
  pmtRequest = ''
  pmtHash = ''
  pmtSuccessMsg = ''
  pmtError = ''

  //
  // Computed props
  //

  get sortedActors() {
    return this.actors.slice().sort((a, b) => {
      // sort by impact desc if they are not equal
      if (a.impact !== b.impact) return b.impact - a.impact
      // sort by id if they have the same impact
      return a.id - b.id
    })
  }

  //
  // Actions
  //

  gotoActors = () => (this.page = 'actors')
  gotoCreate = () => (this.page = this.connected ? 'create' : 'connect')
  gotoConnect = () => (this.page = 'connect')

  clearError = () => (this.error = '')

  init = async () => {
    // try to fetch the node's info on startup
    try {
      await this.fetchInfo()
      this.connected = true
    } catch (err:any) {
      // don't display an error, just disconnect
      this.connected = false
    }

    // fetch the actors from the backend
    try {
      this.actors = await api.fetchActors()
    } catch (err:any) {
      this.error = err.message
    }

    // connect to the backend WebSocket and listen for events
    const ws = api.getEventsSocket()
    ws.addEventListener('message', this.onSocketMessage)
  }

  connectToLnd = async (host: string, cert: string, macaroon: string) => {
    this.clearError()
    try {
      await api.connect(host, cert, macaroon)
      this.connected = true
      this.fetchInfo()
      this.gotoActors()
    } catch (err:any) {
      this.error = err.message
    }
  }

  disconnect = () => {
    api.clearToken()
    this.connected = false
  }

  fetchInfo = async () => {
    const info = await api.getInfo()
    this.alias = info.alias
    this.balance = parseInt(info.balance)
    this.pubkey = info.pubkey
  }

  fetchActors = async () => {
    this.clearError()
    try {
      this.actors = await api.fetchActors()
    } catch (err:any) {
      this.error = err.message
    }
  }

  createActor = async (name:string) => {
    this.clearError()
    try {
      await api.createActor(name)
      this.gotoActors()
    } catch (err:any) {
      this.error = err.message
    }
  }

  assignImpact = async () => {
    this.pmtError = ''
    try {
      if (!this.pmtForActor) throw new Error('No actor selected to upvote')
      await api.assignImpact(this.pmtForActor.id, this.pmtHash)
      this.pmtSuccessMsg = `Your payment of ${this.pmtAmount} sats to ${this.pmtForActor.username} was successful! The actor has been upvoted!`
    } catch (err:any) {
      this.pmtError = err.message
    }
  }

  verifyActor = async (actorId: number) => {
    this.clearError()
    try {
      const actor = await api.verifyActor(actorId)
      this._updateActor(actor)
    } catch (err:any) {
      this.error = err.message
    }
  }

  showPaymentRequest = async (actor: Actor) => {
    this.clearError()
    try {
      const res = await api.createInvoice(actor.id.toString())
      this.pmtForActor = actor
      this.pmtAmount = res.amount
      this.pmtRequest = res.payreq
      this.pmtHash = res.hash
      this.pmtSuccessMsg = ''
      this.pmtError = ''
      this.showPayModal = true
    } catch (err:any) {
      this.error = err.message
    }
  }

  hidePaymentRequest = () => {
    this.pmtForActor = undefined
    this.pmtAmount = ''
    this.pmtRequest = ''
    this.pmtHash = ''
    this.pmtSuccessMsg = ''
    this.pmtError = ''
    this.showPayModal = false
  }

  //
  // WebSocket listener
  //

  onSocketMessage = (msg: MessageEvent) => {
    const event = JSON.parse(msg.data)
    // update the actors array when a actor is updated on the server
    if (event.type === SocketEvents.actorUpdated) {
      // replacing the existing actor with this new one
      this._updateActor(event.data)
    }
    if (event.type === SocketEvents.invoicePaid) {
      const { hash, amount, pubkey } = event.data
      // asignn Impact to the the actor when the incoming payment is made for the
      // pmtHash the we are waiting for
      if (hash === this.pmtHash) {
        this.assignImpact()
      }
      // update the balance when an invoice is paid to the current user
      if (pubkey === this.pubkey) {
        this._incrementBalance(parseInt(amount))
      }
    }
  }

  //
  // Private helper methods
  //
  private _incrementBalance = (amount: number) => {
    this.balance = this.balance + amount

    // make it rain for 3 seconds 💸
    this.makeItRain = true
    setTimeout(() => {
      this.makeItRain = false
    }, 3000)
  }

  private _updateActor = (actor: Actor) => {
    this.actors = [
      // the updated actor
      actor,
      // the existing actors excluding the one that was updated
      ...this.actors.filter(p => p.id !== actor.id),
    ]
  }
}
