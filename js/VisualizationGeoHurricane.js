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
	let hurricanesPath = map.append('g').attr('class', 'hurricanes')

	let zoom = d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent([[0, 0], [width, height]])
		.on('zoom', _ => {
			map.attr('transform', d3.event.transform)
		})
	svg.call(zoom)

	let color = d3.scaleLinear().domain([0, 150])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#FFF500"), d3.rgb('#007AFF')])

	// Load storms data
	loadCsv('json/storms.csv').then(data => {
		let hurricanes = nestById(cropPeriod(data, '2015/01/01', '2016/01/01'))
		// let coordinates = hurricanes.map(h => h.values.map(d => [d.lon, d.lat]))
		
		// hurricanesPath.datum({type: 'MultiLineString', coordinates: coordinates})
		// 	.attr('d', geoGenerator)

		hurricanesPath
			.selectAll('g')
			.data(hurricanes)
			.enter()
			.append('g')
				.selectAll('circle')
				.data(h => h.values)
				.enter()
				.append('circle')
					.attr('transform', d => `translate(${projection([d.lon, d.lat])})`)
					.attr('r', d => 1 + d.wind / 100)
					.attr('fill', d => color(d.wind))

	})

	// Init map
	d3.json('json/ne.json', function (err, json) {
		let landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)

		landPath.datum({type: 'FeatureCollection', features: landGeojson.features})
			.attr('d', geoGenerator)
	})

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
