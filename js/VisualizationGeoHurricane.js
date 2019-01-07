'use strict'

async function GeoHurricane(svg) {
	let width = 720,
		height = 480

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
	// const hurricanesPath = map.append('g').attr('class', 'hurricanes')
	// 	.style('stroke', '#000')
	// 	.style('stroke-width', .1)
	// 	.style('fill', 'none')
		// .style('opacity', .1)

	const hurricanesPoints = map.append('g')

	const zoom = d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent([[0, 0], [width, height]])
		.on('zoom', _ => {
			map.attr('transform', d3.event.transform)
		})
	svg.call(zoom)

	const color = d3.scaleLinear().domain([0, 140])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#FFF500"), d3.rgb('#007AFF')])

	const color2 = d3.scaleSequential()
		.domain([1, 12])
		.interpolator(d3.interpolateRainbow)

	// const color3 = d3.scaleLinear().domain([1850, 2016])
	// 	.interpolate(d3.interpolateHcl)
	// 	.range([d3.rgb("#FFF500"), d3.rgb('#007AFF')])
		
	// Load storms data
	const data = await getHurricaneData()
	
	const yearStart = 1950
	const yearEnd = 2018

	const allHurricanes = nestById(data)
	let displayed = []
	// let displayedCoordinates = []
	let date

	const currentDateText = map.append('text')
		.attr('x', '2em')
		.attr('y', '2em')
		.attr('class', 'mono')

	const nbYearsToKeep = 10
	const opacityChange = 1 / nbYearsToKeep

	function playTimeline(startYear, endYear) {

		function filterHurricanes(season) {
			hurricanesPoints
				.append('g')
				.attr('class', `season-${season}`)

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

			displayed = allHurricanes.filter(h => h.values[0].year === season)
			// displayedCoordinates = displayed.map(h => h.values.map(d => [d.lon, d.lat]))

			// hurricanesPath.append('path').datum({type: 'MultiLineString', coordinates: displayedCoordinates})
			// 	.attr('d', geoGenerator)
			// 	.style('stroke', color3(season))
		}

		async function playSeason(season) {
			date = new Date(`01/01/${season}`)
			let endDate = new Date(`01/01/${season + 1}`)
			
			filterHurricanes(season)

			const addTime = setInterval(_ => {
				date.setTime(date.getTime() + 200000000)

				updateHurricanes(season)
				
				if (date >= endDate) {
					clearInterval(addTime)
					playSeason(season + 1)
				}
			}, 50)
		}

		playSeason(startYear)
	}

	function updateHurricanes(season) {
		const h = hurricanesPoints
			.select(`.season-${season}`)
			.selectAll('g')
			.data(displayed)

		h.enter()
			.append('g')
			.selectAll('circle')
			.data(h => h.values)
			.enter()
				.append('circle')
				.attr('transform', d => `translate(${projection([d.lon, d.lat])})`)
				.attr('r', d => .75 + d.wind / 75)
				// .attr('fill', d => d.wind ? color(d.wind) : '#999')
				.attr('fill', d => color2(d.timestamp.getMonth()))
				.attr('class', 'hidden')

				.on('click', d => {
					EventEngine.triggerEvent(EventEngine.EVT.hurricaneSelected, d.id)
				})

		h.selectAll('circle.hidden')
			.attr('class', d => (d.timestamp <= date) ? '' : 'hidden')
		
		h.exit().remove()

		currentDateText.text(date.toLocaleDateString())
	}

	playTimeline(yearStart, yearEnd)
	// })

	// Load and init land map
	d3.json('json/ne.json', function (err, json) {
		const landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)

		landPath.datum({type: 'FeatureCollection', features: landGeojson.features})
			.attr('d', geoGenerator)
	})

	// Resize svg to window
	function resize () {
		width = document.querySelector('.container').offsetWidth
		height = Math.max(window.innerHeight - document.querySelector('header').offsetHeight, 480)

		svg.attr('width', width)
			.attr('height', height)
	}

	window.addEventListener('resize', resize)
}

function GeoHurricaneFocus(svg, txtDiv) {
	svg.style('background', '#222')
	txtDiv.html('GeoHurricane focus')
}
