
// --------------------------------------------------------------------------
// ----------------------------------------- DATA LOADER / TRANDFORM --------

async function loadCsv(path) {
  return new Promise((ok, rej) => {

    d3.csv(path, data => {
      // Add Date object form time attribute parsing (ISO 8601)
      data.forEach(dat => {
        dat.timestamp = new Date(dat.time)
        dat.lat = +dat.lat
        dat.lon = +dat.lon
        dat.wind = +dat.wind
        dat.pres = +dat.pres
        dat.year = +dat.year
      })

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

// --------------------------------------------------------------------------
// ---------------------------------------------------- EVENT ENGINE --------

class EventEngine {

  // ----------------------- ALL EVENTS (non-exhaustive list)
  static get EVT() {
    return {
      sliderTimeChange:-1, // args: timestamp
      fromTimeChange:0, // args: timestamp
      toTimeChange:1, // args: timestamp
      hurricaneSelected:2, // args: hurricaneId
      hurricaneUnselected:3, // args: hurricaneId
      hurricaneMouseEnter:4, // args: hurricaneId
      hurricaneMouseExit:5 // args: hurricaneId
    }
  }

  // ----------------------- Method to trigger any event with n arguments
  //
  // -- use example:
  //      triggerEvent(EventEngine.EVT.hurricaneSelected, hurricaneId)
  //
  static triggerEvent(eventId) {

    if(!EventEngine.eventMap.hasOwnProperty(eventId)) {
      EventEngine.eventMap[eventId] = []
      return
    }

    // --- load extra-arguments
    let fullArguments = []
    for(let arg of arguments)
      fullArguments.push(arg)
    fullArguments.splice(0,1)

    for(let callbackMethod of EventEngine.eventMap[eventId])
      // --- transform into an event call
      setTimeout(function(){callbackMethod(...fullArguments)})

  }

  // ----------------------- Register a method to an event triggerer
  static registerTo(eventId, callbackMethod) {

    if(EventEngine.eventMap == null)
      EventEngine.eventMap = {}

    if(!EventEngine.eventMap.hasOwnProperty(eventId))
      EventEngine.eventMap[eventId] = []

    EventEngine.eventMap[eventId].push(callbackMethod)

  }

}
