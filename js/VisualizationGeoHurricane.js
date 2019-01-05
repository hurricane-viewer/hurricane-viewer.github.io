'use strict'

function GeoHurricane(svg) {
	let width = 720,
		height = 480

	resize()

	svg.style('background', '#fff')

	// let projection = d3.geoNaturalEarth1()
	let projection = d3.geoCylindricalStereographic()
		.rotate([200, 0, 0]) // Center on the pacific ocean
		.scale(150)
		.translate([width / 2, height / 2])
	
	let geoGenerator = d3.geoPath()
		.projection(projection)

	let map = svg.append('g')

	let landPath = map.append('path').attr('class', 'land')
	let hurricanesPath = map.append('path').attr('class', 'hurricanes')
		.style('stroke', '#000')
		.style('stroke-width', 1)
		.style('fill', 'none')
		.style('opacity', .1)

	let hurricanesPoints = map.append('g')

	let zoom = d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent([[0, 0], [width, height]])
		.on('zoom', _ => {
			map.attr('transform', d3.event.transform)
		})
	svg.call(zoom)

	let color = d3.scaleLinear().domain([0, 140])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#FFF500"), d3.rgb('#007AFF')])

	// Load storms data
	loadCsv('json/storms.csv').then(data => {
		let yearStart = 1975
		let yearEnd = 2018

		let allHurricanes = nestById(data)
		let displayed = []
		let displayedCoordinates = []
		let date

		let currentDateText = map.append('text')
			.attr('x', '2em')
			.attr('y', '2em')
			.attr('class', 'mono')

		function playTimeline(startYear, endYear) {

			function filterHurricanes(season) {
				hurricanesPoints
					.append('g')
					.attr('class', `season-${season}`)

				hurricanesPoints
					.select(`.season-${season - 1}`)
					.style('opacity', .8)
				hurricanesPoints
					.select(`.season-${season - 2}`)
					.style('opacity', .6)
				hurricanesPoints
					.select(`.season-${season - 3}`)
					.style('opacity', .4)
				hurricanesPoints
					.select(`.season-${season - 4}`)
					.style('opacity', .2)
				hurricanesPoints
					.select(`.season-${season - 5}`)
					.remove()

				hurricanesPath
					.selectAll('path')
					.remove()

				displayed = allHurricanes.filter(h => h.values[0].year === season)
				displayedCoordinates = displayed.map(h => h.values.map(d => [d.lon, d.lat]))

				hurricanesPath.datum({type: 'MultiLineString', coordinates: displayedCoordinates})
					.attr('d', geoGenerator)
			}

			async function playSeason(season) {
				date = new Date(`01/01/${season}`)
				let endDate = new Date(`01/01/${season + 1}`)
				
				filterHurricanes(season)

				let addTime = setInterval(_ => {
					date.setTime(date.getTime() + 100000000)
	
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
			let h = hurricanesPoints
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
					.attr('r', d => .5 + d.wind / 100)
					.attr('fill', d => d.wind ? color(d.wind) : '#999')
					.attr('class', 'hidden')

			h.selectAll('circle.hidden')
				.attr('class', d => (d.timestamp <= date) ? '' : 'hidden')
			
			h.exit().remove()

			currentDateText.text(date.toLocaleDateString())
		}

		playTimeline(yearStart, yearEnd)
	})

	// Load and init land map
	d3.json('json/ne.json', function (err, json) {
		let landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)

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
	svg.style('background', '#00f')
	txtDiv.html('DU TEXTE POur le ZoOm')
}
