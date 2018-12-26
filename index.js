'use strict'

// ------------------------------------------------------------------------------
// ----------------------------------------------------- GLOBAL DATA ------------

const GEO_HURRICANE_ID = '#geohurricane'

const GEO_ZOOM_ID = '#geohurricane_zoom'
  const GEO_ZOOM_TXT_ID = '#geozoom_viz'
  const GEO_ZOOM_VIZ_ID = '#geozoom_txt'

const HURRICANE_PROPERTY = '#hurricaneproperty'

const PLANET_HEATING_ID = '#planetheating'
  const PLANET_HEATING_VIZ_ID = '#planetheating_viz'
  const PLANET_HEATING_TXT_ID = '#planetheating_txt'

// ------------------------------------------------------------------------------
// --------------------------------------------- DATA VIZ MANAGEMENT ------------

var geoHurricane_svg = d3.select(GEO_HURRICANE_ID).append('svg')

var geoHurricaneZoom_txt = d3.select(GEO_ZOOM_TXT_ID)
var geoHurricaneZoom_svg = d3.select(GEO_ZOOM_VIZ_ID).append('svg')

var hurricaneProperty_svg = d3.select(HURRICANE_PROPERTY).append('svg')

var planetHeating_svg = d3.select(PLANET_HEATING_VIZ_ID).append('svg')
var planetHeating_txt = d3.select(PLANET_HEATING_TXT_ID)

// --- launch dataviz
GeoHurricane(geoHurricane_svg)
GeoHurricaneZoom(geoHurricaneZoom_svg, geoHurricaneZoom_txt)

HurricaneProperty(hurricaneProperty_svg)

PlanetHeating(planetHeating_svg, planetHeating_txt)