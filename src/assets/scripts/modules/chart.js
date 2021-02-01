import Chartist from 'chartist'

const SELECTORS = {
    chartContainer: '.js-chart-container'
}

function generateBarChart(element, { labels, series }) {
    console.log('generating barchart...', element, { series })
    const options = {
        stackBars: true,
        height: 300
    }
    return new Chartist.Bar(element, { labels, series }, options)
}

const containers = document.querySelectorAll(SELECTORS.chartContainer)
if (containers) {
    Array.from(containers).forEach((container) => {
        const sourceId = container.dataset.source
        const sourceScript = document.getElementById(sourceId)

        if (sourceScript) {
            const data = JSON.parse(sourceScript.textContent)
            generateBarChart(container, data)
        }
    })
}
