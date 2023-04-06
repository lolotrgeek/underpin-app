import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { calc_impact } from './app/impact';

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
        const db = []
        setDb(db)
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
    const loadDB = async () => {
      try {
        if (!db) return
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
      let data = { actor, impact: impact_prediction.impact, action: params.action, state: params.state }
      setImpact(impact_prediction.impact)
      // setBlock(hash)
    } catch (error) {
      console.log(error)
    }

  }

  const handleUpdate = async () => {
    try {
      // let last_block = await db.get(block);
      let block = { hash: '123', payload: { value: { actor: '123', impact: 123, action: 123, state: 123 } } }
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
