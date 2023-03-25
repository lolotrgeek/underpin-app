import React, { useState, useEffect } from 'react';
import './styles/App.css';
import * as IPFS from 'ipfs-core'
import OrbitDB from 'orbit-db'
import { calc_impact } from './app/impact';
import Protector from 'libp2p-pnet'

const swarmKeyBuffer = Buffer("2F6B65792F737761726D2F70736B2F312E302E302F0A2F6261736531362F0A356238393035363166396262333532323531313233323765613333643661393634666331376636366434396432366562613262333162626339653439636461630A", "hex")

function App() {
  const [block, setBlock] = useState('')
  const [impact, setImpact] = useState(0)
  const [state, setState] = useState(0)
  const [actor, setActor] = useState(crypto.randomUUID())
  const [ipfs, setIpfs] = useState(null)
  const [db, setDb] = useState(null)

  const writeBlock = data => new TextEncoder().encode(JSON.stringify(data))
  const readBlock = block => new TextDecoder().decode(JSON.parse(block))

  useEffect(() => {
    const init = async () => {
      try {
        let new_ipfs = await IPFS.create({
          repo: 'underpin' + Math.random(),
          EXPERIMENTAL: { pubsub: true },
          preload: { "enabled": false },
          config: {
            Pubsub: {
              enabled: true,
              PubSubRouter: "gossipsub",
              Router: "gossipsub",
            },
            Addresses: {
              Swarm: [
                // "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
                // "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
              ],
              Bootstrap: [
                "/ip4/192.168.50.57/tcp/4001/p2p/12D3KooWPs316f6ZuVhUXa3bZaA6W37YWHVud3on6wyprU65fjhi",
                "/ip4/192.168.50.57/tcp/4001/ws/p2p/12D3KooWPs316f6ZuVhUXa3bZaA6W37YWHVud3on6wyprU65fjhi",
              ],

              API: "/ip4/192.168.50.57/tcp/5001",
              Gateway: "/ip4/192.168.50.57/tcp/8080",

            },
            API: {
              "HTTPHeaders": {
                "Access-Control-Allow-Origin": [
                  "http://127.0.0.1:3000",
                  "http://192.168.50.57:4001",
                ]
              }
            },
            Bootstrap: [
              "/ip4/192.168.50.57/tcp/4001/ws/p2p/12D3KooWPs316f6ZuVhUXa3bZaA6W37YWHVud3on6wyprU65fjhi"
            ],
          },
          libp2p: {
            modules: {
              connProtector: new Protector(swarmKeyBuffer),
            },
            config: {
              bootstrap: {
                interval: 10000,
                enabled: true,
                list: [
                  '/ip4/192.168.50.57/tcp/4001/p2p/12D3KooWPs316f6ZuVhUXa3bZaA6W37YWHVud3on6wyprU65fjhi',
                  "/ip4/192.168.50.57/tcp/4001/ws/p2p/12D3KooWPs316f6ZuVhUXa3bZaA6W37YWHVud3on6wyprU65fjhi",
                ]
              }
            }
          }

        })
        setIpfs(new_ipfs)
        setImpact(0)
      } catch (e) {
        console.log(e)
      }
    }

    init()
    return () => {
      console.log('unmounting')
    }
  }, [])

  useEffect(() => {
    const loadOrbit = async () => {
      try {
        if (!ipfs) return
        const orbitdb = await OrbitDB.createInstance(ipfs)
        const new_db = await orbitdb.log("underpin")
        setDb(new_db)
      } catch (e) {
        console.log(e)
      }
    }
    loadOrbit()
  }, [ipfs])

  useEffect(() => {
    const loadDB = async () => {
      try {
        if (!db) return
        await db.load()
        // Listen for updates from peers
        db.events.on("replicated", address => {
          console.log(db.iterator({ limit: 1 }).collect())
        })
      } catch (e) {
        console.log(e)
      }
    }
    loadDB()
  }, [db])



  const handleAction = async params => {
    try {
      setState(params.state)
      console.log(params)
      let impact_prediction = calc_impact({ before: state, after: params.state }, params.action)
      // let hash = await addBlock({ actor, impact: impact_prediction.impact, action: params.action, state: params.state }, db)
      let hash = await db.add({ actor, impact: impact_prediction.impact, action: params.action, state: params.state })
      console.log(hash)
      setImpact(impact_prediction.impact)
      // setBlock(hash)
    } catch (error) {
      console.log(error)
    }

  }

  const handleUpdate = async () => {
    try {
      // let last_block = await db.get(block);
      let block = await db.iterator({ limit: 1, reverse: true }).collect()[0]
      console.log(block);
      setImpact(block.payload.value.impact)
      setState(block.payload.value.state)
      setBlock(block.hash)

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      {db ? (
        <div>
          Actor: {actor}
          <br />
          Impact: {impact}
          <br />
          Current State: {state}
          <br />
          Last Block: {block}
          <br />
          <button type="text" name="action" onClick={() => handleAction({ action: 1, state: state + 1 })}>Action!</button>
          <br />
          <button type="text" name="update" onClick={handleUpdate}>Update From Chain !</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default App;
