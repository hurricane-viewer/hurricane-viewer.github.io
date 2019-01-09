'use strict'

// ------------------------------------------------------------------------------
// ----------------------------------------------------- GLOBAL DATA ------------

const ID_GEO_HURRICANE = '#geohurricane'

const ID_HURRICANE_PROPERTY = '#hurricaneproperty'

const ID_PLANET_HEATING_VIZ = '#planetheating-viz'

// ------------------------------------------------------------------------------
// --------------------------------------------- DATA VIZ MANAGEMENT ------------

async function main() {
    var geoHurricaneSvg = d3.select(ID_GEO_HURRICANE).append('svg')
    
    var hurricanePropertySvg = d3.select(ID_HURRICANE_PROPERTY).append('svg')
    
    var planetHeatingSvg = d3.select(ID_PLANET_HEATING_VIZ).append('svg')
    
    // --- launch dataviz
    await GeoHurricane(geoHurricaneSvg)
    
    await HurricaneProperty(hurricanePropertySvg)
    
    PlanetHeating(planetHeatingSvg)

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
