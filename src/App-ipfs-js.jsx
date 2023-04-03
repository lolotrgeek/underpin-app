import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { calc_impact } from './app/impact';
import { decodeMessage } from './app/utils.js'
import { dialer } from './app/dialer.js'

// const swarmKeyBuffer = Buffer("2F6B65792F737761726D2F70736B2F312E302E302F0A2F6261736531362F0A356238393035363166396262333532323531313233323765613333643661393634666331376636366434396432366562613262333162626339653439636461630A", "hex")

function App() {
  const [block, setBlock] = useState('')
  const [impact, setImpact] = useState(0)
  const [state, setState] = useState(0)
  const [actor, setActor] = useState(crypto.randomUUID())
  const [db, setDb] = useState(null)

  const writeBlock = data => new TextEncoder().encode(JSON.stringify(data))
  const readBlock = block => new TextDecoder().decode(JSON.parse(block))

  useEffect(() => {
    const init = async () => {
      try {
        const log = await dialer() 
        setDb(log)
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

  // setup reconnect logic

  const handleAction = async params => {
    try {
      setState(params.state)
      console.log(params)
      let impact_prediction = calc_impact({ before: state, after: params.state }, params.action)
      // let hash = await addBlock({ actor, impact: impact_prediction.impact, action: params.action, state: params.state }, db)
      let hash = await db.append({ actor, impact: impact_prediction.impact, action: params.action, state: params.state })
      console.log(hash)
      setImpact(impact_prediction.impact)
      // setBlock(hash)
    } catch (error) {
      console.log(error)
    }

  }

  const handleUpdate = async () => {
    try {
      let block = db.getLast()
      console.log(block)
      setImpact(block.payload.impact)
      setState(block.payload.state)
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