const { DateTime } = require('luxon')

module.exports = {
    icon: function (name) {
        return `<svg class="icon icon--${name}" role="img" aria-hidden="true" width="24" height="24">
                    <use xlink:href="#icon-${name}"></use>
                </svg>`
    },

    barchart: function (data, id) {
        const json = JSON.stringify(data)
        return `<div class="chartcontainer js-chart-container" data-source="chart-data-${id}"></div>
                <script type="application/json" id="chart-data-${id}">${json}</script>`
    },

    sparkline: function (report) {
        const now = DateTime.utc()
        const endDate = DateTime.fromISO(report.to, { zone: 'utc' })
        let daysOffset = 0

        if (endDate > now) {
            const diff = endDate.diff(now, ['days']).toObject()
            daysOffset = Math.ceil(diff.days)
        }

        const series = report.data.timeseries.series.map((s) => s.data)
        const range = series[0].length - daysOffset
        const totals = []

        for (let i = 0; i < range; i++) {
            let sum = 0
            for (let j = 0; j < series.length; j++) {
                const value = series[j][i]
                if (typeof value === 'number') {
                    sum += value
                }
            }
            totals.push(sum)
        }
        const csv = totals.join(',')
        return `<div class="sparkline js-sparkline" data-values="${csv}"><canvas width="150" height="30"></canvas></div>`
    }
}
