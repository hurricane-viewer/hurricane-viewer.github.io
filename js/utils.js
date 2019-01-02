
async function loadCsv(path) {
  return new Promise((ok,rej) => {
    d3.csv(path,function(data) {
      for(let dat of data) {
        dat.timestamp = new Date(dat.time)
      }
      ok(data)
    })
  })
}

function cropPeriod(csvData, from, to) {
  from = typeof(from)==typeof('')?(new Date(from)):from
  to = typeof(to)==typeof('')?(new Date(to)):to
  let corped_data = []
  for(let dat of csvData)
    if(dat.timestamp>=from && dat.timestamp<=to)
      corped_data.push(dat)
  return corped_data
}

function nestById(csvData) {
  let nested_data = d3.nest()
    .key(function(dat) { return dat.id })
    .entries(csvData)
  return nested_data
}