getAllLogs(0, "0xd0a6e6c54dbc68db5db3a091b171a77407ff7ccf").then(logs => {
  var html = ""
  var amounts = {}
  var sum = 0
  for (var log of logs) {
    if (log.topics[0].slice(0, 10) == "0xe054057d") {
      var data = log.data.slice(2)
      var window = data.slice(0x00, 0x40)
      var address = data.slice(0x58, 0x80)
      var amount = data.slice(0x80, 0x120)
      if (Number(window) == 0) {
        amounts[address] = new BigNumber(`0x${amount}`).plus(amounts[address] || 0)
        sum = new BigNumber(`0x${amount}`).plus(sum)
      }
    }
  }

  for (var address of Object.keys(amounts).sort((a, b) => amounts[a].lt(amounts[b]) ? 1 : -1)) {
    html += `<tr><th><code>${address}</code></th><td align=right style="padding-left: 2rem">${amounts[address].dividedBy(sum).times(200000000).toFixed(4)}</td></tr>`
  }

  document.body.innerHTML += `<table>${html}</table>`
})
