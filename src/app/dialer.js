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
import OrbitDB from 'orbit-db'

// https://github.com/libp2p/js-libp2p/blob/master/examples/libp2p-in-the-browser/index.js


export async function dialer() {
  const wrtcStar = webRTCStar()
  // use the same peer id as in `listener.js` to avoid copy-pasting of listener's peer id into `peerDiscovery`
  const hardcodedPeerId = '12D3KooWCuo3MdXfMgaqpLC5Houi1TRoFqgK9aoxok4NK5udMu8m'
  const bootstrapNode = [`/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct/p2p/${hardcodedPeerId}`]

  let peerID = await createEd25519PeerId()

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
    config: { Addresses: { Delegates: [], Bootstrap: [] }, Bootstrap: [] },
  })

  const orbitdb = await OrbitDB.createInstance(ipfs)
  const new_db = await orbitdb.log("underpin")

  return { orbitdb, new_db }
}
