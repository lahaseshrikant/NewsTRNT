const fetch = require('node-fetch');
(async()=>{
  const res = await fetch('http://localhost:5002/api/market/currencies');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();