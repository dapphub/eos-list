function uint256(number) {
  return padLeft("0", 64, Number(number).toString(16))
}

function formatDateAbsolute(date) {
  return date.format("MMM DD, kk:mm:ss")
}

function formatDate(date) {
  if (new Date - date.unix() * 1000 > 1000 * 60 * 60 * 24 * 14) {
    return formatDateAbsolute(date)
  } else {
    return date.fromNow()
  }
}

function parseMoney(hexnum, decimals) {
  return new BigNumber(`0x${hexnum}`).dividedBy(`1e${decimals}`)
}

function formatETH(hexnum) {
  return `${new BigNumber(hexnum, 16).dividedBy(new BigNumber("1e18"))} ETH`
}

function padLeft(padding, width, string) {
  return repeat(padding, Math.max(0, width - string.length)) + string
}

function repeat(x, n) {
  return new Array(n + 1).join(x)
}

function update(values) {
  Object.keys(values).filter(id => {
    var element = document.getElementById(id)
    if (element) {
      element.innerHTML = values[id]
      if (element.tagName = "A") {
        if (element.dataset.type == "address") {
          element.href = `https://etherscan.io/address/${values[id]}`
        }
      }
    }
  })
}

function toQueryString(params) {
  return Object.keys(params).map(name => ([
    encodeURIComponent(name),
    encodeURIComponent(params[name]),
  ])).map(([name, value]) => `${name}=${value}`).join("&")
}

function etherscan(params) {
  return fetch(`https://api.etherscan.io/api?${
    toQueryString(params)
  }`).then(response => {
    if (response.ok) {
      return response.json().then(json => {
        if (json.error) {
          return Promise.reject(new Error(JSON.stringify(json.error)))
        } else {
          return json.result
        }
      })
    } else {
      return Promise.reject(new Error(`HTTP ${response.statusCode}`))
    }
  })
}

function getAllLogs(blockNumber, address) {
  let allLogs = []
  let previousBlockNumber = blockNumber

  function next() {
    return etherscan({
      module    : "logs",
      action    : "getLogs",
      fromBlock : +previousBlockNumber + 1,
      toBlock   : "latest",
      address   : address,
    }).then(logs => {
      if (logs.length == 0) {
        return allLogs
      } else {
        let blockNumber = +logs[logs.length - 1].blockNumber
        previousBlockNumber = blockNumber
        allLogs = [...allLogs, ...logs]
        return next()
      }
    })
  }

  return next()
}
