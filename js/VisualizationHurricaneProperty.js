'use strict'

async function HurricaneProperty(svg) {

  console.log('loading data...')
  let data = await loadCsv('json/storms.csv')

  console.log('croping...')
  data = cropPeriod(data, '01/01/2000', '01/01/2020')

  console.log('nesting...')
  data = nestById(data)

  // svg.style('background','#0f0')

  // --------------------------------------------------------------------
  // ------------------------------------------ POSITIONNING DATA -------

  let width = parseInt(svg.style("width").replace('px',''))
  let height = parseInt(svg.style("height").replace('px',''))

  let innerMargins = 30

  let innerWidth = width - 2*innerMargins
  let innerHeight = height - 2*innerMargins

  let innerG = svg.append('g')
    .style('transform','translate('+innerMargins+'px, '+innerMargins+'px)')

  // --------------------------------------------------------------------
  // ----------------------------------------------------- SCALES -------

  let timeScale = d3.scaleLinear()
    .domain([0,1000])
    .range([0, innerWidth]);

  let yScale = d3.scaleLinear()
    .domain([0,500])
    .range([0, innerHeight]);


  // --------------------------------------------------------------------
  // ------------------------------------------------- AXIS/GRIDS -------
  let timeAxis = d3.axisBottom()
                 .scale(timeScale)

  let y_axis = d3.axisLeft()
                 .scale(yScale)


  innerG.append("g")
     .attr('transform','translate(0,'+innerHeight+')')
     .call(timeAxis)

  innerG.append("g")
     .call(y_axis);


  // --------------------------------------------------------------------
  // ----------------------------------------------- DISPLAY DATA -------

}