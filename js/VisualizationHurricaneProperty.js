'use strict'

async function HurricaneProperty(svg) {

  let fullData = null
  let fullHurricaneData = null
  let hurricaneMap = {}
  let selectedHurricanes = []
  let overedHurricanes = []
  let fromTime = '01/01/1100'
  let toTime = '01/01/9000'
  let currentTime = null

  async function loadAllData(from='01/01/1100', to='01/01/9000') {

    if(fullData == null)
      fullData = await getHurricaneData()
      // fullData = (await loadCsv('json/storms.csv')).filter(rec=>rec.wind!='')
    let data = cropPeriod(fullData, from, to)
    data = nestById(data)

    data.forEach(hur => {
      hur.name = hur.values[0].name
      hur.beginTime = hur.values[0].timestamp/1000
      hur.values.forEach(dat => dat.timeFromBegin = 
        dat.timestamp/1000 - hur.beginTime
      )
      hur.timeLength = hur.values[hur.values.length-1].timeFromBegin
      hur.winds = hur.values.map(val => {
        return {wind:val.wind,time:val.timeFromBegin}
      })
      //hur.winds = hur.winds.filter(val => val.wind != 0)
    })

    function getWindSum(dat) {
      return dat.winds.reduce((a,b) =>({wind: a.wind + b.wind}),{wind:0}).wind
    }

    data = data.filter(dat => getWindSum(dat) > 0)

    hurricaneMap = {}
    for(let i in data) {
      hurricaneMap[data[i].key] = i
    }

    return data
  }

  fullHurricaneData = await loadAllData(fromTime, toTime)

  // --------------------------------------------------------------------
  // ------------------------------------------ POSITIONNING DATA -------

  let width = parseInt(svg.style("width").replace('px',''))
  let height = 500;//parseInt(svg.style("height").replace('px',''))
  svg.attr("height",height)

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

  function displayData(data, timeData = [], overData = []) {

    // --- scales
    timeLengthScale
      .domain([0,d3.max(data.map(dat=>{return dat.timeLength}))])

    yScale
      .domain([0,d3.max(data.map(dat=>{
        return d3.max(dat.winds.map(val=>{return val.wind}))
      }))])

    function timeSpent(d) {
      if(d == 0)
        return 'apparition'
      else if(d<60)
        return d+' secondes'
      else if(d < 60*60)
        return Math.floor(d/60) + ' minutes'
      else if(d < 60*60*24)
        return Math.floor(d/60/60) + ' heures'
      else if(d < 60*60*24*7)
        return Math.floor(d/60/60/24) + ' jours'
      else if(d < 60*60*24*7*30)
        return Math.floor(d/60/60/24/7) + ' semaines'
      else if(d < 60*60*24*7*30*12)
        return Math.floor(d/60/60/24/7/30) + ' mois'
    }

    // --- axis
    x_axis.scale(timeLengthScale).tickFormat(function(d){return timeSpent(d)})
    y_axis.scale(yScale)

    d3.select('.x_axis').transition().call(x_axis)
    d3.select('.y_axis').transition().call(y_axis)

    // --- display
    let displays = displayG.selectAll('path').data(data,function(d){return d.key})
    let names = displayG.selectAll('text').data(data,function(d){return d.key})
    let circles = displayG.selectAll('circle').data(timeData,function(d){return d.key})

    function getHurricaneId(key) {
      for(let i in data)
        if(data[i].key == key)
          return i
      return -1
    }

    function getStrokeWidth(key) {
      if(overData.indexOf(key) > -1)
        return 15
      return 5
    }

    function getOpacity(key) {
      if(overData.length == 0)
        return 1
      if(overData.indexOf(key) > -1)
        return 1
      return 0.2
    }

    // --- ENTER
    displays.enter()
      .append('path')
        .attr('d', function(d){ return lineFunction(d.winds)})
        .attr('fill','none')
        .attr('stroke',function(d,i){ return colorScheme(i) })
        .attr('stroke-width',5)
        .attr('stroke-linecap','round')
        .attr('opacity',0)
        .transition()
        .attr('opacity',1)

    displays
        .transition()
        .attr('stroke-width',function(d) { return getStrokeWidth(d.key) })
        .attr('opacity', function(d){ return getOpacity(d.key)})
        .attr('d', function(d){ return lineFunction(d.winds)})

    names.enter()
      .append('text')
        .attr('font-family','sans-serif')
        .attr('x',function(d,i){ return timeLengthScale(d.winds[0].time) + 5})
        .attr('y',function(d,i){ return yScale(d.winds[0].wind) + 23})
        .attr('fill',function(d,i){ return colorScheme(i) })
        .text(function(d){ return d.name })
        .attr('opacity',0)
        .transition()
        .attr('opacity',1)

    names
        .transition()
        .attr('opacity', function(d){ return getOpacity(d.key)})
        .attr('x',function(d,i){ return timeLengthScale(d.winds[0].time) + 5})
        .attr('y',function(d,i){ return yScale(d.winds[0].wind) + 23})

    displayG.selectAll('path')
        .on('click', function(d) {
          if(selectedHurricanes.indexOf(d.key) > -1)
            EventEngine.triggerEvent(EventEngine.EVT.hurricaneUnselected,d.key)
          else
            EventEngine.triggerEvent(EventEngine.EVT.hurricaneSelected,d.key)
        })
        .on('mouseover',function(d) {
          EventEngine.triggerEvent(EventEngine.EVT.hurricaneMouseEnter,d.key)
        })
        .on('mouseout',function(d) {
          EventEngine.triggerEvent(EventEngine.EVT.hurricaneMouseExit,d.key)
        })

    circles.enter()
      .append('circle')
        .attr('cx',function(d,i){ return timeLengthScale(d.time) })
        .attr('cy',function(d,i){ return yScale(d.wind) })
        .attr('r',10)
        .attr('opacity',0)
        .attr('fill',function(d){ return colorScheme(getHurricaneId(d.key)) })
        .transition()
        .attr('opacity',1)
    circles
        .attr('cx',function(d,i){ return timeLengthScale(d.time) })
        .attr('cy',function(d,i){ return yScale(d.wind) })

    // --- EXIT
    
    let exitDuration = 100
    function exitFunc(elm) {
      elm
        .transition().duration(exitDuration)
        .attr('opacity',0)
        .transition().delay(exitDuration)
        .remove()
    }

    displays.exit().call(exitFunc)
    names.exit().call(exitFunc)
    circles.exit().call(exitFunc)

  }

  // --------- Create time slider vizualisation data
  function createTimeData(dispData) {
    if(currentTime == null)
      return []
    let timeData = []
    for(let hur of dispData) {
      let hurId = hur.key
      let begin = hur.beginTime
      let end = begin + hur.timeLength
      if(currentTime >= begin && currentTime <= end) {

        let timeForHur = currentTime - begin
        let afterData = hur.winds.filter(val=>val.time >= timeForHur)[0]
        let beforeData = hur.winds.filter(val=>val.time <= timeForHur)
        beforeData = beforeData[beforeData.length-1]

        let wind = 0
        if(afterData == beforeData)
          wind = beforeData.wind
        else {

          let distToTime = timeForHur - beforeData.time
          let fullTimeDist = afterData.time - beforeData.time

          let ratio = distToTime / fullTimeDist

          let fullWindDist = afterData.wind - beforeData.wind
          wind = beforeData.wind + fullWindDist * ratio

        }

        let timeObj = {
          key:hurId,
          time:timeForHur,
          wind:wind
        }
        timeData.push(timeObj)
      }
    }
    return timeData
  }

  // --------- Generic update view method
  function updateView() {
    let dispData = []
    if(selectedHurricanes.length == []) {

      // What to do when no selection ...
      if(fullHurricaneData.length > 10) {
        dispData = [
          fullHurricaneData[0],
          fullHurricaneData[fullHurricaneData.length-1]
        ]
      }
      else {
        dispData = fullHurricaneData
      }

    }
    else {
      for(let hurId of selectedHurricanes) {
        let hurricaneIndex = hurricaneMap[hurId]
        dispData.push(fullHurricaneData[hurricaneIndex])
      }
    }
    displayData(dispData, createTimeData(dispData), overedHurricanes)
  }

  // --- First update
  updateView()

  // --------------------------------------------------------------------
  // -------------------------------------------- EVENT HANDELING -------

  // ----- SELECT
  EventEngine.registerTo(EventEngine.EVT.hurricaneSelected,function(hurId) {

    let alreadySelected = selectedHurricanes.indexOf(hurId) > -1
    let inMap = hurricaneMap.hasOwnProperty(hurId)

    if(alreadySelected)
      EventEngine.triggerEvent(EventEngine.EVT.hurricaneUnselected, hurId)
    else if(inMap) {
      selectedHurricanes.push(hurId)
      updateView()
    }

  })

  EventEngine.registerTo(EventEngine.EVT.hurricaneUnselected,function(hurId) {

    let index = selectedHurricanes.indexOf(hurId)
    let alreadySelected = index > -1

    if(alreadySelected) {
      selectedHurricanes.splice(index,1)
      updateView()
    }

  })

  // ----- TIME & TIME RANGE
  EventEngine.registerTo(EventEngine.EVT.sliderTimeChange,function(newCurrentTime) {

    currentTime = newCurrentTime
    updateView()

  })

  EventEngine.registerTo(EventEngine.EVT.fromTimeChange,async function(newFromTime) {
    fromTime = newFromTime
    fullHurricaneData = await loadAllData(fromTime, toTime)
    updateView()
  })

  EventEngine.registerTo(EventEngine.EVT.toTimeChange,async function(newToTime) {
    toTime = newToTime
    fullHurricaneData = await loadAllData(fromTime, toTime)
    updateView()
  })


  // ----- HOVER
  EventEngine.registerTo(EventEngine.EVT.hurricaneMouseEnter,function(hurId) {

    let alreadyOvered = overedHurricanes.indexOf(hurId) > -1
    let inMap = hurricaneMap.hasOwnProperty(hurId)

    if(!alreadyOvered && inMap) {
      overedHurricanes.push(hurId)
      updateView()
    }

  })

  EventEngine.registerTo(EventEngine.EVT.hurricaneMouseExit,function(hurId) {

    let index = overedHurricanes.indexOf(hurId)
    let alreadyOvered = index > -1

    if(alreadyOvered) {
      overedHurricanes.splice(index,1)
      updateView()
    }
  })

}
