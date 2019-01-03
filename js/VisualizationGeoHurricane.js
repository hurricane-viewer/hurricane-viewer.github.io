'use strict';

function GeoHurricane(svg) {
	let width = 720,
		height = 480;

	svg.attr('width', width)
		.attr('height', height)
		.style('background', '#fff')

	let projection = d3.geoNaturalEarth1()
		.rotate([216, 0, 0])
		.scale(132)
		.translate([width / 2, height / 2])
	
	let geoGenerator = d3.geoPath()
		.projection(projection)

	let map = svg.append('g')
	let landPath = map.append('path').attr('class', 'land')
	let hurricanesPath = map.append('path').attr('class', 'hurricanes')
		.style('stroke', 'red')
		.style('stroke-width', .5)
		.style('fill', 'none')

	let zoom = d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent([[0, 0], [width, height]])
		.on('zoom', _ => {
			map.attr('transform', d3.event.transform)
		})

	svg.call(zoom)

	// Load storms data
	loadCsv('json/storms.csv').then(data => {
		let hurricanes = nestById(cropPeriod(data, '2015/01/01', '2016/01/01'))
		let coordinates = hurricanes.map(h => h.values.map(d => [d.lon, d.lat]))
		
		hurricanesPath.datum({type: 'MultiLineString', coordinates: coordinates})
			.attr('d', geoGenerator)
	})

	// Init map
	d3.json('json/ne.json', function (err, json) {
		let landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)

		landPath.datum({type: 'FeatureCollection', features: landGeojson.features})
			.attr('d', geoGenerator)
	})
}

function GeoHurricaneFocus(svg, txtDiv) {
	svg.style('background', '#00f')
	txtDiv.html('DU TEXTE POur le ZoOm')
}
