
async function loadCsv(path) {
  return new Promise((ok, rej) => {

    d3.csv(path,function(data) {
      // Add Date object form time attribute parsing (ISO 8601)
      data.forEach(dat.timestamp = new Date(dat.time))

      ok(data)
    })
  })
}

function cropPeriod(data, from, to) {
  from = typeof(from) === 'string' ? (new Date(from)) : from
  to = typeof(to) === 'string' ? (new Date(to)) : to

  return data.filter(dat => (from <= dat.timestamp && dat.timestamp <= to))
}

function nestById(csvData) {
  let nested_data = d3.nest()
    .key(function(dat) { return dat.id })
    .entries(csvData)
  return nested_data
}
