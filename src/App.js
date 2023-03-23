import React, { useState, useEffect } from 'react';
import './styles/App.css';
import * as IPFS from 'ipfs-core'
import OrbitDB from 'orbit-db'
import { calc_impact } from './app/impact';

const createBlock = async (key, value, db) => await db.add({ key, value })
const readBlock = async (hash, db) => await db.get(hash)


function App() {
  const [block, setBlock] = useState([{}])
  const [impact, setImpact] = useState(0)
  const [state, setState] = useState(0)
  const [actor, setActor] = useState(crypto.randomUUID())
  const [ipfs, setIpfs] = useState(null)
  const [db, setDb] = useState(null)

  // const createBlock = (key, value) => new TextEncoder().encode(JSON.stringify({key, value}))
  // const readBlock = block => new TextDecoder().decode(JSON.parse(block))



  useEffect(() => {
    const init = async () => {
      let name = { repo: 'underpin' }
      let new_ipfs = await IPFS.create(name)
      setIpfs(new_ipfs)
      const orbitdb = await OrbitDB.createInstance(ipfs)
      const new_db = await orbitdb.eventlog(name.repo)
      setDb(new_db)
      await db.load()
      // Listen for updates from peers
      db.events.on("replicated", address => {
        console.log(db.iterator({ limit: -1 }).collect())
      })
      let hash = await createBlock(actor + '_impact', 0, db)
      setBlock(hash)
      setImpact(0)
    }
    const cleanup = async () => {
      await db.stop()
    }

    init()
    return () => {
      console.log('unmounting')
      cleanup()
    }
  }, [])

  // useEffect(() => {
  //   const update = async () =>{let last_block = await readBlock(block, ipfs);console.log(last_block)}
  //   update()
  // }, [state])

  const handleAction = async params => {
    setState(params.state)
    console.log(params)
    let impact_prediction = calc_impact({ before: state, after: params.state }, params.action)
    let hash = await createBlock(actor + '_impact', impact_prediction, db)
    setImpact(impact_prediction.impact)
    setBlock(hash)
  }


  return (
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
      <button type="text" name="update" onClick={async () => { let last_block = await readBlock(block, db); console.log(last_block); setImpact(last_block.value.value.impact) }}>Update From Chain !</button>
    </div>
  )
}

export default App;
