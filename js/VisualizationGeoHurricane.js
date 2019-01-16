'use strict'

async function GeoHurricane(svg) {
	let width = 720,
		height = 480

	const startDate = new Date('01/01/1995')

	const nbYearsToKeep = 10
	const opacityChange = 1 / nbYearsToKeep

	const playTimeStepMs = 12 * 60 *60 * 1000
	const playTimeInterval = 50

	resize()

	svg.style('background', '#fff')

	const projection = d3.geoNaturalEarth1()
	// const projection = d3.geoCylindricalStereographic()
		.rotate([200, 0, 0]) // Center on the pacific ocean
		.scale(150)
		.translate([width / 2, height / 2])
	
	const geoGenerator = d3.geoPath()
		.projection(projection)

	const map = svg.append('g')

	const landPath = map.append('path').attr('class', 'land')

	const citiesPoints = map.append('g').attr('class', 'cities')
	// const hurricanesPath = map.append('g').attr('class', 'hurricanes')
	// 	.style('stroke', '#000')
	// 	.style('stroke-width', .1)
	// 	.style('fill', 'none')
		// .style('opacity', .1)

	const hurricanesPoints = map.append('g').attr('class', 'hurricanes')

	const zoom = d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent([[0, 0], [width, height]])
		.on('zoom', _ => {

			map.attr('transform', d3.event.transform)
			
		})
	svg.call(zoom)

	const colorScaleWind = d3.scaleLinear().domain([0, 140])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#d9f0a3"), d3.rgb('#004529')])

	const colorScaleSeason = d3.scaleSequential()
		.domain([1, 12])
		.interpolator(d3.interpolateRainbow)

	const colorScalePressure = d3.scaleLinear().domain([920, 1010])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#ccebc5"), d3.rgb('#0868ac')])

	const colorScalePopulation = d3.scaleLinear().domain([0, 10000000])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#a8ddb5"), d3.rgb('#084081')])
		
	// Load storms data
	const data = await getHurricaneData()
	
	const allHurricanes = nestById(data)
	let displayed = []
	// let displayedCoordinates = []
	let date
	let addTimeInterval

	const currentDateText = svg.append('text')
		.attr('x', '2em')
		.attr('y', '2em')
		.attr('class', 'mono')
	
	const legendheight = 200,
		legendwidth = 70,
		margin = {top: 10, right: 60, bottom: 10, left: 2}
	
	const colorLegend = d3.select('#color-legend')
		.style('height', legendheight + 'px')
		.style('width', legendwidth + 'px')
		.style('position', 'absolute')
		.style('margin-top', '60px')
		.style('margin-left', '40px')

	const legendText = svg.append('text')
		.attr('x', '2em')
		.attr('y', '3.5em')
		.attr('class', 'mono')

	let currentScale = 'season'
	setGeoColor('season')
	function setGeoColor(type) {
		if (type) {
			switch (type) {
				case 'wind':
					updateColorLegend(colorScaleWind)
					legendText.text('Wind (knots)')
					break
				
				case 'season':
					updateColorLegend(colorScaleSeason)
					legendText.text('Season (month)')
					break
	
				case 'pressure':
					updateColorLegend(colorScalePressure)
					legendText.text('Pressure')
					break
			}
			currentScale = type
		} else {
			type = currentScale
		}

		switch (type) {
			case 'wind':
				hurricanesPoints
					.selectAll('circle')
					.attr('fill', d => d.wind ? colorScaleWind(d.wind) : '#999')
				break
			
			case 'season':
				hurricanesPoints
					.selectAll('circle')
					.attr('fill', d => colorScaleSeason(d.timestamp.getMonth()))
				break

			case 'pressure':
				hurricanesPoints
					.selectAll('circle')
					.attr('fill', d => colorScalePressure(d.pres))
				break
		}
	}

	function updateColorLegend(colorScale) {
		colorLegend.select('.axis').remove()

		const canvas = colorLegend
			.append('canvas')
			.attr('height', legendheight - margin.top - margin.bottom)
			.attr('width', 1)
			.style('height', (legendheight - margin.top - margin.bottom) + 'px')
			.style('width', (legendwidth - margin.left - margin.right) + 'px')
			.style('border', '1px solid #000')
			.style('position', 'absolute')
			.style('top', margin.top + 'px')
			.style('left', margin.left + 'px')
			.node()

		const ctx = canvas.getContext('2d')
		const legendscale = d3.scaleLinear()
			.range([1, legendheight - margin.top - margin.bottom])
			.domain(colorScale.domain())

		const image = ctx.createImageData(1, legendheight)
		d3.range(legendheight).forEach(function(i) {
			var c = d3.rgb(colorScale(legendscale.invert(i)))
			image.data[4*i] = c.r
			image.data[4*i + 1] = c.g
			image.data[4*i + 2] = c.b
			image.data[4*i + 3] = 255
		})
		ctx.putImageData(image, 0, 0)

		const legendaxis = d3.axisRight()
			.scale(legendscale)
			.tickSize(6)
			.ticks(8)

		const svg = colorLegend
			.append('svg')
			.attr('height', (legendheight) + 'px')
			.attr('width', (legendwidth) + 'px')
			.style('position', 'absolute')
			.style('left', '8px')
			.style('top', '0px')
		svg
			.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(${(legendwidth - margin.left - margin.right + 3)},${margin.top})`)
			.call(legendaxis)
	}

	const colorScaleChooser = document.getElementById('hurricane-color-select')
	colorScaleChooser.addEventListener('change', _ => {
		setGeoColor(colorScaleChooser.value)
	})

	function filterHurricanes(season) {
		displayed = allHurricanes.filter(h => h.values[0].year === season)

		hurricanesPoints
			.append('g')
			.attr('class', `season-${season}`)
			.selectAll('g')
			.data(displayed)
			.enter()
			.append('g')
				.selectAll('circle')
				.data(h => h.values)
				.enter()
				.append('circle')
					.attr('transform', d => `translate(${projection([d.lon, d.lat])})`)
					.attr('r', d => .75 + d.wind / 75)
					.attr('class', 'hidden')

					.on('click', d => {
						EventEngine.triggerEvent(EventEngine.EVT.hurricaneSelected, d.id)
					})
					.on('mouseover', d => {


						map.append('text')
						.attr('id', 'hurricaneMouseOverTooltip')
						.attr('transform', `translate(${projection([d.lon, d.lat])})`)
						.append('tspan')
						.text(`${d.name} - ${d.wind} knots ${d.pres}mb`)

						EventEngine.triggerEvent(EventEngine.EVT.hurricaneMouseEnter, d)

					})
					.on('mouseout', _ => {
						
						d3.select('#hurricaneMouseOverTooltip').remove()

					})
		
		setGeoColor()

		for (let i = 1; i < nbYearsToKeep; i++) {
			hurricanesPoints
				.select(`.season-${season - i}`)
				.style('opacity', 1 - opacityChange * i)
		}

		hurricanesPoints
			.select(`.season-${season - nbYearsToKeep}`)
			.remove()

		// hurricanesPath
		// 	.selectAll('path')
		// 	.remove()
		// displayedCoordinates = displayed.map(h => h.values.map(d => [d.lon, d.lat]))

		// hurricanesPath.append('path').datum({type: 'MultiLineString', coordinates: displayedCoordinates})
		// 	.attr('d', geoGenerator)
		// 	.style('stroke', color3(season))
	}

	function playSeason(season) {
		date = new Date(`01/01/${season}`)
		let endDate = new Date(`01/01/${season + 1}`)
		
		filterHurricanes(season)

		addTimeInterval = setInterval(_ => {
			date.setTime(date.getTime() + playTimeStepMs)

			updateHurricanes(season)
			
			if (date >= endDate) {
				clearInterval(addTimeInterval)
				EventEngine.triggerEvent(EventEngine.EVT.sliderTimeChange, endDate)
			}
		}, playTimeInterval)
	}

	function updateHurricanes(season) {
		hurricanesPoints
			.select(`.season-${season}`)
			.selectAll('g')
			.data(displayed)
			.selectAll('circle.hidden')
				.attr('class', d => (d.timestamp <= date) ? '' : 'hidden')

		currentDateText.text(date.toLocaleDateString())
	}

	EventEngine.registerTo(EventEngine.EVT.sliderTimeChange, date => {
		clearInterval(addTimeInterval)
		// clearAll()
		playSeason(date.getFullYear())
	})

	// Load and init land map
	d3.json('json/ne.json', function (err, json) {
		const landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)

		landPath.datum({type: 'FeatureCollection', features: landGeojson.features})
			.attr('d', geoGenerator)
	})

	d3.csv('json/geonames_cities100000.csv', function (err, json) {
		citiesPoints.selectAll('rect')
			.data(json)
			.enter()
			.append('rect')
				.attr('transform', d => `translate(${projection([+d.longitude, +d.latitude])})`)
				.attr('width', d => Math.sqrt(d.population) / 1000)
				.attr('height', d => Math.sqrt(d.population) / 1000)
				.attr('fill', d => colorScalePopulation(d.population))
	})

	// Resize svg to window
	function resize () {
		width = document.querySelector('.container').offsetWidth
		height = Math.max(window.innerHeight - document.querySelector('header').offsetHeight, 480)

		svg.attr('width', width)
			.attr('height', height)
	}

	window.addEventListener('resize', resize)
	EventEngine.triggerEvent(EventEngine.EVT.sliderTimeChange, startDate)
}

function GeoHurricaneFocus(svg, txtDiv) {
	svg.style('background', '#222')
	txtDiv.html('GeoHurricane focus')
}
