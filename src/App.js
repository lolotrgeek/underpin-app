import React, { useState, useEffect } from 'react';
import './styles/App.css';

function App() {
  const [data, setData] = useState([{}]);

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
      query += `${Object.keys(params)[0]}=${Object.values(params)[0]}`
    }
    const response = await fetch(query);
    const jsonData = await response.json();
    console.log(jsonData);
    setData(!Array.isArray(jsonData) ? [jsonData] : jsonData);
  };
  useEffect(() => {
    fetchData({ initial: true });
  }, []);

  const handleFormSubmit = params => {
    console.log(params)
    fetchData(params);
  };

  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}

export default App;
