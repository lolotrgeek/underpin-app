export const fetchData = async (type, params, setData) => {
    let query = `http://localhost:5000/${type}}`
    if (!query) return null
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