'use strict';

function GeoHurricane(svg) {
	let width = 720,
		height = 480;

	svg.attr('width', width)
		.attr('height', height)

	// Load storms data
	loadCsv('json/storms.csv').then(data => {
		let storms = nestById(cropPeriod(data, '2000/01/01', '2020/01/01'))
	})

	// Init map
	d3.json('json/ne.json', function (err, json) {
		let landGeojson = topojson.feature(json, json.objects.ne_50m_admin_0_countries)
		mapInit(landGeojson.features)
	})

	function mapInit(features) {
		let projection = d3.geoNaturalEarth1()
			.rotate([216, 0, 0])
			.scale(132)
			.translate([width / 2, height / 2])
		
		let geoGenerator = d3.geoPath()
			.projection(projection)

		let path = svg.append('path')
			.datum({type: 'FeatureCollection', features: features})
			.attr('d', geoGenerator)

		let zoom = d3.zoom()
			.scaleExtent([1, 8])
			.translateExtent([[0, 0], [width, height]])
			.on('zoom', _ => {
				path.attr('transform', d3.event.transform)
			})

		svg.call(zoom)
	}
}

function GeoHurricaneFocus(svg, txtDiv) {
	svg.style('background', '#00f')
	txtDiv.html('DU TEXTE POur le ZoOm')
}
