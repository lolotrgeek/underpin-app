import React, { useState, useEffect } from 'react';
import './styles/App.css';

function App() {
  const [data, setData] = useState([{}]);
  const [state, setState] = useState([0]);

  const fetchData = async params => {
    let query = `http://localhost:8002/impact?`
    if (Array.isArray(params)) {
      params.map((param, index) => {
        if (param.value) {
          if (index > 0) query += '&'
          query += `${param.key}=${param.value}`
          console.log(query)
        }
        return param
      })
    }
    else {
      let keys = Object.keys(params)
      let values = Object.values(params)
      keys.map((key, index) => {
        if (index > 0) query += '&'
        query += `${key}=${values[index]}`
        return key
      })
    }
    console.log(query)
    const response = await fetch(query);
    const jsonData = await response.json();
    console.log(jsonData);
    setData(jsonData);
  };
  useEffect(() => {
    fetchData({ initial: true });
  }, []);

  const handleAction = params => {
    setState([...state, params.after])
    console.log(params)
    fetchData(params);
  };

  return (
    <div>
      Impact: {data.impact}
      <br />
      Current State: {state[state.length-1]}
      <br />
      <button type="text" name="action"  onClick={() => handleAction({action: 1, before: state[state.length-1], after: state[state.length-1]+1})}>Action!</button>
    </div>
  )
}

export default App;
