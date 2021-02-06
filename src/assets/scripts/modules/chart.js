import Chartist from 'chartist'
import 'chartist-plugin-tooltips'

const SELECTORS = {
    chartContainer: '.js-chart-container'
}

function generateBarChart(element, { labels, series }) {
    const tooltipLabels = {
        'like-of': 'Likes',
        'in-reply-to': 'Replies',
        'repost-of': 'Reposts',
        'mention-of': 'Mentions',
        'bookmark-of': 'Bookmarks'
    }
    const tooltip = new Chartist.plugins.tooltip({
        anchorToPoint: true
    })
    const data = {
        labels,
        series: series.map((s) => {
            if (tooltipLabels[s.name]) {
                s.name = tooltipLabels[s.name]
            }
            return s
        })
    }
    const options = {
        stackBars: true,
        height: 300,
        plugins: [tooltip]
    }
    return new Chartist.Bar(element, data, options)
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
