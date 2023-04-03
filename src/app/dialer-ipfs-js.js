import { createLibp2p } from 'libp2p'
import { webRTCDirect } from '@libp2p/webrtc-direct'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { bootstrap } from '@libp2p/bootstrap'
import { webRTCStar } from '@libp2p/webrtc-star'
import { webSockets } from '@libp2p/websockets'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { create } from 'ipfs'
import Log from 'ipfs-log'
import IdentityProvider from 'orbit-db-identity-provider'
import { decodeMessage } from './utils'

// https://github.com/libp2p/js-libp2p/blob/master/examples/libp2p-in-the-browser/index.js


export async function dialer() {
  const wrtcStar = webRTCStar()
  // use the same peer id as in `listener.js` to avoid copy-pasting of listener's peer id into `peerDiscovery`
  const hardcodedPeerId = '12D3KooWCuo3MdXfMgaqpLC5Houi1TRoFqgK9aoxok4NK5udMu8m'
  const bootstrapNode = [`/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct/p2p/${hardcodedPeerId}`]

  let peerID = await createEd25519PeerId()

  console.log("peerID", peerID.toString())

  const libp2pBundle = async () => await createLibp2p({
    peerId: peerID,
    addresses: {
      listen: [
        "/dns4/localhost/tcp/24642/ws/p2p-webrtc-star/",
      ],
    },
    transports: [webSockets(), webRTCDirect(), wrtcStar.transport],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: [
      wrtcStar.discovery,
      bootstrap({ list: bootstrapNode }),
      pubsubPeerDiscovery({ interval: 1000 })
    ],
  })


  const ipfs = await create({
    repo: "dailer" + Math.random(),
    libp2p: libp2pBundle,
    start: false,
    config: { Addresses: { Delegates: [], Bootstrap: [] }, Bootstrap: [] },
  })

  const identity = await IdentityProvider.createIdentity({ id: "underpin" })
  const log = new Log(ipfs, identity)

  await ipfs.start()

  ipfs.pubsub.subscribe('msg', async evt => {
    try {
      let msg = decodeMessage(evt.data)
      let block = JSON.parse(msg)
      if(block.hash && block.payload) {
        await log.append(block)
      }
    } catch (error) {
      console.log(error)
    }

  })


  async function append(data) {
    let block = await log.append(data)
    console.log(Log.isLog(block))
    ipfs.pubsub.publish('msg', new TextEncoder().encode(JSON.stringify(block)))
    return block
  }

  function getAll() {
    return log.values
  }

  function getLast() {
    return log.values[log.values.length - 1]
  }

  return { append, getAll, getLast }
}
