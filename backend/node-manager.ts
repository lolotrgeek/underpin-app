import createLnRpc, { LnRpc, createWalletRpc, WalletRpc } from '@radar/lnrpc'
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { LndNode } from './db'

export const NodeEvents = {
  invoicePaid: 'invoice-paid',
}

class NodeManager extends EventEmitter {

  private _nodes: [
    {
      "name": "carol",
      "grpc_host": "127.0.0.1:10003",
      "tls_cert": "2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a4343416379674177494241674951452f6d616c505a7572612b354a785a3751357756657a414b42676771686b6a4f50515144416a41784d5238770a485159445651514b45785a73626d5167595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566a59584a76624441650a467730794d7a41314d4445784f44497a4d7a4e61467730794e4441324d6a55784f44497a4d7a4e614d444578487a416442674e5642416f54466d78755a4342680a645852765a3256755a584a686447566b49474e6c636e5178446a414d42674e5642414d5442574e68636d39734d466b77457759484b6f5a497a6a3043415159490a4b6f5a497a6a304441516344516741453633413574766d7865516556654f5675414b306a714553326846527a656f355a6e6c45484a6e344b43433949706c314d0a33525252346f553834327a6152475835336452376e70364673584151494d7438536a764671614f4278544342776a414f42674e56485138424166384542414d430a41715177457759445652306c42417777436759494b775942425155484177457744775944565230544151482f42415577417745422f7a416442674e56485134450a466751552b4f504638593750374c2b3036776e59453855566d756c5752504177617759445652305242475177596f4946593246796232794343577876593246730a6147397a644949465932467962327943446e4276624746794c5734784c574e68636d397367675231626d6c3467677031626d6c346347466a61325630676764690a64575a6a623235756877522f4141414268784141414141414141414141414141414141414141414268775373464141464d416f4743437147534d343942414d430a413067414d4555434951434b4536524358764d58536c7a586f45336b625244765461486a5a4c764a386e48385253735667326a306e41496743746336584b4e720a633372416e584c7034387546513930375574645a304762496f362b4c4f707870766f593d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a",
      "macaroon": "0201036c6e640267030a10f08eff1ec3c515fd14339014c574f2cf1201301a0c0a04696e666f1204726561641a170a08696e766f69636573120472656164120577726974651a160a076d657373616765120472656164120577726974651a100a086f6666636861696e12047265616400000620c77f79ab7aac5f55ab53e0bc9898a19af41640e64dcc2233aff6ccc2c0ff270a"
    }
  ]

  public static lnrpc: LnRpc;
  public static walletrpc: WalletRpc;

  /**
   * a mapping of token to gRPC connection. This is an optimization to
   * avoid calling `createLnRpc` on every request. Instead, the object is kept
   * in memory for the lifetime of the server.
   */
  private _lndNodes: Record<string, LnRpc> = {}

  /**
   * Retrieves the in-memory connection to an LND node
   */
  getRpc(token: string): LnRpc {
    if (!this._lndNodes[token]) {
      throw new Error('Not Authorized. You must login first!')
    }

    return this._lndNodes[token]
  }

  /**
   * 
   * @returns a random node from the list of nodes
   */
  async selectNode() {
    return this._nodes[Math.floor(Math.random() * this._nodes.length)]
  }

  /**
   * Tests the LND node connection by validating that we can get the node's info
   */
  async connect(host: string, cert: string, macaroon: string, prevToken?: string) {

    // generate a random token, without
    const token = prevToken || uuidv4().replace(/-/g, '')

    try {
      // add the connection to the cache
      const rpc = await createLnRpc({
        server: host,
        cert: Buffer.from(cert, 'hex').toString('utf-8'), // utf8 encoded certificate
        macaroon, // hex encoded macaroon
      })

      // verify we have permission get node info
      const { identityPubkey: pubkey } = await rpc.getInfo()

      // verify we have permission to get channel balances
      await rpc.channelBalance()

      // verify we can sign a message
      const msg = Buffer.from('authorization test').toString('base64')
      const { signature } = await rpc.signMessage({ msg })

      // verify we have permission to verify a message
      await rpc.verifyMessage({ msg, signature })

      // verify we have permissions to create a 1sat invoice
      const { rHash } = await rpc.addInvoice({ value: '1' })

      // verify we have permission to lookup invoices
      await rpc.lookupInvoice({ rHash })

      // listen for payments from LND
      this.listenForPayments(rpc, pubkey)

      // store this rpc connection in the in-memory list
      this._lndNodes[token] = rpc

      // return this node's token for future requests
      return { token, pubkey }
    } catch (err) {
      // remove the connection from the cache since it is not valid
      if (this._lndNodes[token]) {
        delete this._lndNodes[token]
      }
      throw err
    }
  }

  /**
   * Reconnect to all persisted nodes to to cache the `LnRpc` objects
   * @param nodes the list of nodes
   */
  async reconnectNodes(nodes: LndNode[]) {
    for (const node of nodes) {
      const { host, cert, macaroon, token } = node
      try {
        console.log(`Reconnecting to LND node ${host} for token ${token}`)
        await this.connect(host, cert, macaroon, token)
      } catch (error) {
        // the token will not be cached
        console.error(`Failed to reconnect to LND node ${host} with token: ${token}`)
      }
    }
  }

  /**
   * listen for payments made to the node. When a payment is settled, emit
   * the `invoicePaid` event to notify listeners of the NodeManager
   */
  listenForPayments(rpc: LnRpc, pubkey: string) {
    const stream = rpc.subscribeInvoices()
    stream.on('data', invoice => {
      if (invoice.settled) {
        const hash = (invoice.rHash as Buffer).toString('base64')
        const amount = invoice.amtPaidSat
        this.emit(NodeEvents.invoicePaid, { hash, amount, pubkey })
      }
    })
  }

  /**
   * Creates a wallet on the LND node
   * @param host 
   * @param cert 
   * @param macaroon 
   * @returns 
   */
  async createWallet(host: string, cert: string, macaroon: string) {
    await createWalletRpc({
      server: host,
      cert: Buffer.from(cert, 'hex').toString('utf-8'), // utf8 encoded certificate
      macaroon, // hex encoded macaroon
    })
    
    
  }

  async getWalletBalance(host: string, cert: string, macaroon: string) {
    
  }

  // TODO: wallet as 'pool' of funds, connecting to a single node and testing adding funds to the 'pool' from user wallets and automatically signing invoices


}

export default new NodeManager()
