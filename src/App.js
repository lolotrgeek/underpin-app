import React, { useState, useEffect } from 'react';
import './styles/App.css';
import * as IPFS from 'ipfs-core'
import { calc_impact } from './app/impact';

const createBlock = async (key, value, ipfs) => await ipfs.dag.put({key, value})
const readBlock = async (block, ipfs) => await ipfs.dag.get(block)

function App() {
  const [block, setBlock] = useState([{}])
  const [impact, setImpact] = useState(0)
  const [state, setState] = useState(0)
  const [ipfs, setIpfs] = useState(null)

  // const createBlock = (key, value) => new TextEncoder().encode(JSON.stringify({key, value}))
  // const readBlock = block => new TextDecoder().decode(JSON.parse(block))

  
  
  useEffect(() => {
    const init = async () => {
      let new_ipfs = await IPFS.create({ repo: 'ok' + Math.random() })
      setIpfs(new_ipfs)
      let put_cid = await createBlock('impact', 0, new_ipfs)
      setBlock(put_cid)
      setImpact(0)
    }
    init()
    return () => {
      console.log('unmounting')
    }
  }, [])

  // useEffect(() => {
  //   const update = async () =>{let last_block = await readBlock(block, ipfs);console.log(last_block)}
  //   update()
  // }, [state])

  const handleAction = async params => {
    setState(params.state)
    console.log(params)
    let impact_prediction = calc_impact({before: state, after: params.state}, params.action )
    let put_cid = await createBlock('impact', impact_prediction, ipfs)
    setImpact(impact_prediction.impact)
    setBlock(put_cid)
  }


  return (
    <div>
      Impact: {impact}
      <br />
      Current State: {state}
      <br />
      <button type="text" name="action" onClick={() => handleAction({ action: 1, state: state+1 })}>Action!</button>
      <br />
      <button type="text" name="update" onClick={async () =>{let last_block = await readBlock(block, ipfs);console.log(last_block); setImpact(last_block.value.value.impact)}}>Update From Chain !</button>
    </div>
  )
}

export default App;
