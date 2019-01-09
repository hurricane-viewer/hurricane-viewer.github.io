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
        EventEngine.triggerEvent(EventEngine.EVT.sliderTimeChange, new Date(`01/01/${yearSlider.value}`))
        yearSlider.setAttribute('style', `background-size:${(yearSlider.value - 1842) * 100 / 174}% 100%`)
        d3.selectAll('g.hurricanes g').remove()
    })

    EventEngine.registerTo(EventEngine.EVT.sliderTimeChange, date => {
        const year = date.getFullYear()
        yearSlider.value = year
        yearSlider.setAttribute('style', `background-size:${(year - 1842) * 100 / 174}% 100%`)
    })

    yearSlider.setAttribute('style', `background-size:${(yearSlider.value - 1842) * 100 / 174}% 100%`)
}

main()
