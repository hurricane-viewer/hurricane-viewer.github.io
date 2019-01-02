'use strict'

async function HurricaneProperty(svg) {

  let array = [1,2,3,4]
  console.log(array)

  let fullData = null
  let hurricaneMap = {}
  let fromTime = '01/01/1100'
  let toTime = '01/01/9000'

  async function loadAllData(from='01/01/1100', to='01/01/9000') {

    if(fullData == null)
      fullData = (await loadCsv('json/storms.csv')).filter(rec=>rec.wind!='')
    let data = cropPeriod(fullData, from, to)
    data = nestById(data)

    hurricaneMap = {}
    for(let i in data) {
      hurricaneMap[data[i].key] = i
    }

    data.forEach(hur => {
      let beginTime = hur.values[0].timestamp/1000
      hur.values.forEach(dat => dat.timeFromBegin = 
        dat.timestamp/1000 - beginTime
      )
      hur.timeLength = parseInt(hur.values[hur.values.length-1].timeFromBegin)
      hur.winds = hur.values.map(val => {
        return {wind:parseInt(val.wind),time:val.timeFromBegin}
      })
      hur.winds = hur.winds.filter(val => !isNaN(val.wind))
    })

    return data
  }

  let data = await loadAllData(fromTime, toTime)

  // --------------------------------------------------------------------
  // ------------------------------------------ POSITIONNING DATA -------

  let width = parseInt(svg.style("width").replace('px',''))
  let height = parseInt(svg.style("height").replace('px',''))

  let leftMargin = 30
  let bottomMargin = 20

  let innerWidth = width - 2*leftMargin
  let innerHeight = height - 2*bottomMargin

  let innerG = svg.append('g')
    .style('transform','translate('+leftMargin+'px, '+bottomMargin+'px)')

  // --------------------------------------------------------------------
  // ----------------------------------------------------- SCALES -------

  let timeLengthScale = d3.scaleLinear()
    .range([0, innerWidth]);

  let yScale = d3.scaleLinear()
    .range([innerHeight, 0]);


  // --------------------------------------------------------------------
  // ------------------------------------------------- AXIS/GRIDS -------
  let x_axis = d3.axisBottom()

  let y_axis = d3.axisLeft()
    
  innerG.append("g")
    .attr('class','x_axis')
    .attr('transform','translate(0,'+innerHeight+')')

  innerG.append("g")
    .attr('class','y_axis')

  let displayG = innerG.append('g')


  // --------------------------------------------------------------------
  // ----------------------------------------------- DISPLAY DATA -------

  var lineFunction = d3.line()
    .x(function(d) { return timeLengthScale(d.time); })
    .y(function(d) { return yScale(d.wind); })

  var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)

  function displayData(data) {

    // --- scales
    timeLengthScale
      .domain([0,d3.max(data.map(dat=>{return dat.timeLength}))])

    yScale
      .domain([0,d3.max(data.map(dat=>{
        return d3.max(dat.winds.map(val=>{return val.wind}))
      }))])

    // --- axis
    x_axis.scale(timeLengthScale)
    y_axis.scale(yScale)

    d3.select('.x_axis').transition().call(x_axis)
    d3.select('.y_axis').transition().call(y_axis)

    // --- display
    let displays = displayG.selectAll('path').data(data)

    displays.enter()
      .append('path')
        .merge(displays)
        .attr('stroke',function(d,i){ return colorScheme(i) })
        .attr('stroke-width',2)
        .attr('fill','none')
        .attr('d', function(d){ return lineFunction(d.winds)})

    displays.exit().remove()

  }
  displayData(data)

  // --------------------------------------------------------------------
  // -------------------------------------------- EVENT HANDELING -------

  // ----- SELECT
  EventEngine.registerTo(EventEngine.EVT.hurricaneSelected,function(hurId) {
    if(hurricaneMap.hasOwnProperty(hurId)) {
      displayData([data[hurricaneMap[hurId]]])
    }
  })

  EventEngine.registerTo(EventEngine.EVT.hurricaneUnselected,function() {
    displayData(data)
  })

  // ----- TIME RANGE
  EventEngine.registerTo(EventEngine.EVT.fromTimeChange,async function(newFromTime) {
    fromTime = newFromTime
    let data = await loadAllData(fromTime, toTime)
    console.log(hurricaneMap)
    console.log(data)
    displayData(data)
  })

  EventEngine.registerTo(EventEngine.EVT.toTimeChange,async function(newToTime) {
    console.log('toTime')
    toTime = newToTime
    let data = await loadAllData(fromTime, toTime)
    displayData(data)
  })


  // ----- HOVER
  EventEngine.registerTo(EventEngine.EVT.hurricaneMouseEnter,function() {
    // TODO DISPLAY DATA
  })

  EventEngine.registerTo(EventEngine.EVT.hurricaneMouseExit,function() {
    // UNDISPLAY DATA
  })

}