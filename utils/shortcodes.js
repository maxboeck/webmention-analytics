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
    }
}
