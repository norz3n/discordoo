const fetch = require('node-fetch')
const apiURL = 'https://ddoo.dev/map'

const secret = process.env.SECRET
const key = process.env.COMMIT_HASH_KEY
const value = process.env.COMMIT_HASH_VALUE

async function run() {
  const resp = await fetch(apiURL, { 
    method: 'POST', 
    headers: {
      Authorization: secret,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      hash: { key, value }
    })
  })

  if(resp.status != 200) {
    throw new Error(`failed with code ${resp.status} - ${await resp.text()}`)
  } else {
    console.log(`success with code ${resp.status}`)
  }
}

run()