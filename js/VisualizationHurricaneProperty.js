'use strict'

async function HurricaneProperty(svg) {

  console.log('loading data...')
  let data = await loadCsv('json/storms.csv')

  console.log('croping...')
  data = cropPeriod(data, '01/01/2000', '01/01/2020')

  console.log('nesting...')
  data = nestById(data)

  let wantsToSee = 5
  let every = Math.ceil(data.length / wantsToSee)
  let fullData = []
  for(let datIndex in data)
    if(datIndex%every == 0)
      fullData.push(data[datIndex])
  data = fullData

  data.forEach(hur => {
    let beginTime = hur.values[0].timestamp/1000
    hur.values.forEach(dat => dat.timestamp = 
      dat.timestamp/1000 - beginTime
    )

    hur.timeLength = parseInt(hur.values[hur.values.length-1].timestamp)
    hur.winds = hur.values.map(val => {
      return {wind:parseInt(val.wind),time:val.timestamp}
    })
    hur.winds = hur.winds.filter(val => !isNaN(val.wind))
  })

  console.log(data.length + ' Hurricanes shown')

  // --------------------------------------------------------------------
  // ------------------------------------------ POSITIONNING DATA -------

  let width = parseInt(svg.style("width").replace('px',''))
  let height = parseInt(svg.style("height").replace('px',''))

  let leftMargin = 100
  let bottomMargin = 50

  let innerWidth = width - 2*leftMargin
  let innerHeight = height - 2*bottomMargin

  let innerG = svg.append('g')
    .style('transform','translate('+leftMargin+'px, '+bottomMargin+'px)')

  // --------------------------------------------------------------------
  // ----------------------------------------------------- SCALES -------

  let timeLengthScale = d3.scaleLinear()
    .domain([0,d3.max(data.map(dat=>{return dat.timeLength}))])
    .range([0, innerWidth]);

  let yScale = d3.scaleLinear()
    .domain([0,d3.max(data.map(dat=>{
      return d3.max(dat.winds.map(val=>{return val.wind}))
    }))])
    .range([innerHeight, 0]);


  // --------------------------------------------------------------------
  // ------------------------------------------------- AXIS/GRIDS -------
  let x_axis = d3.axisBottom()
                 .scale(timeLengthScale)

  let y_axis = d3.axisLeft()
                 .scale(yScale)


  innerG.append("g")
     .attr('transform','translate(0,'+innerHeight+')')
     .call(x_axis)

  innerG.append("g")
     .call(y_axis);


  // --------------------------------------------------------------------
  // ----------------------------------------------- DISPLAY DATA -------

  var lineFunction = d3.line()
    .x(function(d) { return timeLengthScale(d.time); })
    .y(function(d) { return yScale(d.wind); })

  var colorScheme = d3.scaleOrdinal(d3.schemeCategory10)

  var bars = innerG.selectAll('hurricaneData')
    .data(data).enter()
      .append('path')
        .attr('stroke',function(d,i){ return colorScheme(i) })
        .attr('stroke-width',2)
        .attr('fill','none')
        .attr('d', function(d){ return lineFunction(d.winds)})

}