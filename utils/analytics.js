const URL = require('url-parse')
const { orderBy, groupBy } = require('lodash')
const { DateTime } = require('luxon')

const EMPTY_COUNT_DATA = {
    'like-of': 0,
    'in-reply-to': 0,
    'repost-of': 0,
    'mention-of': 0,
    'bookmark-of': 0
}

function sortEntries(obj) {
    const list = Object.keys(obj).map((key) => ({
        title: key,
        ...obj[key]
    }))
    const getTotalCount = (entry) => {
        return Object.keys(entry.count).reduce((sum, type) => {
            return sum + entry.count[type]
        }, 0)
    }
    const getTitle = (entry) => entry.title
    return orderBy(list, [getTotalCount, getTitle], ['desc', 'asc'])
}

function makeTimeseries(range) {
    const legend = Object.keys(EMPTY_COUNT_DATA)
    const labels = []
    const series = []
    const initialValues = []

    labels.length = range
    series.length = legend.length
    initialValues.length = range
    initialValues.fill(0)

    series.fill(initialValues)
    for (let i = 0; i < labels.length; i++) {
        labels[i] = i + 1
    }

    return {
        labels,
        series,
        legend
    }
}

function parseEntries(data, range) {
    const totalCount = data.length
    const typeCount = Object.assign({}, EMPTY_COUNT_DATA)

    const targets = {}
    const sources = {}
    const timeseries = makeTimeseries(range)

    const addToSources = (name, type, url) => {
        if (!sources[name]) {
            sources[name] = {
                count: Object.assign({}, EMPTY_COUNT_DATA),
                urls: []
            }
        }
        if (!sources[name].urls.includes(url)) {
            sources[name].urls.push(url)
        }
        if (typeof sources[name]['count'][type] === 'number') {
            sources[name]['count'][type]++
        } else {
            sources[name]['count'][type] = 1
        }
    }

    const addToTargets = (name, type, url) => {
        if (!targets[name]) {
            targets[name] = {
                count: Object.assign({}, EMPTY_COUNT_DATA),
                urls: []
            }
        }
        if (!targets[name].urls.includes(url)) {
            targets[name].urls.push(url)
        }
        if (typeof targets[name]['count'][type] === 'number') {
            targets[name]['count'][type]++
        } else {
            targets[name]['count'][type] = 1
        }
    }

    const addToCounts = (type) => {
        if (typeof typeCount[type] === 'number') {
            typeCount[type] = typeCount[type] + 1
        }
    }

    const addToTimeSeries = (timestamp, type) => {
        if (timestamp) {
            const day = parseInt(DateTime.fromISO(timestamp).toFormat('d'))
            const index = Object.keys(EMPTY_COUNT_DATA).findIndex(
                (t) => t === type
            )

            const values = [...timeseries.series[index]]
            if (index > -1 && day) {
                values[day - 1]++
                timeseries.series[index] = values
            }
        }
    }

    data.forEach((wm) => {
        const source = new URL(wm['wm-source'])
        const target = new URL(wm['wm-target'])
        const type = wm['wm-property']

        addToSources(source.hostname, type, wm['wm-source'])
        addToTargets(target.pathname, type, wm['wm-source'])
        addToTimeSeries(wm['wm-received'], type)
        addToCounts(type)
    })

    return {
        count: {
            total: totalCount,
            ...typeCount
        },
        sources: sortEntries(sources),
        targets: sortEntries(targets),
        timeseries
    }
}

function groupByMonth(data) {
    const getMonthKey = (entry) => {
        const timestamp = entry['wm-received']
        return DateTime.fromISO(timestamp, { zone: 'utc' }).toFormat('yyyy-MM')
    }

    return groupBy(data, getMonthKey)
}

module.exports = function (webmentions) {
    const grouped = groupByMonth(webmentions)
    const dataByMonth = Object.keys(grouped).map((slug) => {
        const month = DateTime.fromISO(slug)
        const title = month.toFormat('MMMM yyyy')
        const from = month.startOf('month').toISODate()
        const to = month.endOf('month').toISODate()
        const range = parseInt(month.endOf('month').toFormat('d'), 10)

        const data = parseEntries(grouped[slug], range)
        return {
            title,
            slug,
            from,
            to,
            data
        }
    })

    return dataByMonth
}
