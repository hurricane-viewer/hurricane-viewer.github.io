'use strict'

// ------------------------------------------------------------------------------
// ----------------------------------------------------- GLOBAL DATA ------------

const ID_GEO_HURRICANE = '#geohurricane'

const ID_GEO_FOCUS_TXT = '#geofocus-txt'
const ID_GEO_FOCUS_VIZ = '#geofocus-viz'

const ID_HURRICANE_PROPERTY = '#hurricaneproperty'

const ID_PLANET_HEATING_VIZ = '#planetheating-viz'
const ID_PLANET_HEATING_TXT = '#planetheating-txt'

// ------------------------------------------------------------------------------
// --------------------------------------------- DATA VIZ MANAGEMENT ------------

async function main() {
    var geoHurricaneSvg = d3.select(ID_GEO_HURRICANE).append('svg')
    
    var geoHurricaneFocusTxt = d3.select(ID_GEO_FOCUS_TXT)
    var geoHurricaneFocusSvg = d3.select(ID_GEO_FOCUS_VIZ).append('svg')
    
    var hurricanePropertySvg = d3.select(ID_HURRICANE_PROPERTY).append('svg')
    
    var planetHeatingSvg = d3.select(ID_PLANET_HEATING_VIZ).append('svg')
    var planetHeatingTxt = d3.select(ID_PLANET_HEATING_TXT)
    
    // --- launch dataviz
    await GeoHurricane(geoHurricaneSvg)
    GeoHurricaneFocus(geoHurricaneFocusSvg, geoHurricaneFocusTxt)
    
    await HurricaneProperty(hurricanePropertySvg)
    
    PlanetHeating(planetHeatingSvg, planetHeatingTxt)

    const yearSlider = document.querySelector('#hurricane-year-slider')

    yearSlider.addEventListener('change', _ => {
        d3.selectAll('g.hurricanes g').remove()
        EventEngine.triggerEvent(EventEngine.EVT.sliderTimeChange, new Date(`01/01/${yearSlider.value}`))
    })

    EventEngine.registerTo(EventEngine.EVT.sliderTimeChange, date => {
        yearSlider.value = date.getFullYear()
    })
}

main()
