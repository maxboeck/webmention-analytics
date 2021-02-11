const URL = require('url-parse')
const { orderBy, groupBy } = require('lodash')
const { DateTime } = require('luxon')
const BLOCKLIST = require('../src/data/blocklist')

const EMPTY_COUNT_DATA = {
    'like-of': 0,
    'in-reply-to': 0,
    'repost-of': 0,
    'mention-of': 0,
    'bookmark-of': 0
}

function isKnownType(type) {
    return Object.keys(EMPTY_COUNT_DATA).includes(type)
}

function sortEntries(obj) {
    const list = Object.keys(obj).map((key) => ({
        key,
        ...obj[key]
    }))
    const getTotalCount = (entry) => {
        return Object.keys(entry.count).reduce((sum, type) => {
            return sum + entry.count[type]
        }, 0)
    }
    const getKey = (entry) => entry.key
    return orderBy(list, [getTotalCount, getKey], ['desc', 'asc'])
}

function makeTimeseries(range) {
    const legend = Object.keys(EMPTY_COUNT_DATA)
    const labels = []
    const initialValues = []
    initialValues.length = range
    initialValues.fill(0)

    const series = legend.map((key) => ({
        name: key,
        data: initialValues
    }))

    labels.length = range
    for (let i = 0; i < labels.length; i++) {
        labels[i] = i + 1
    }

    return {
        labels,
        series
    }
}

function parseEntries(data, range) {
    const counts = Object.assign({}, { total: data.length }, EMPTY_COUNT_DATA)
    const targets = {}
    const sources = {}
    const tweets = {}
    const flagged = []
    const timeseries = makeTimeseries(range)
    const tweetRegex = new RegExp(`/status/(\\d+)`)

    const updateCounts = (type) => {
        if (typeof counts[type] === 'number') {
            counts[type] = counts[type] + 1
        }
    }

    const updateTableData = (table, key, wm) => {
        const type = wm['wm-property']

        if (!isKnownType(type)) {
            return
        }
        if (!key) {
            return
        }
        if (typeof table !== 'object') {
            return
        }

        if (!table[key]) {
            const count = Object.assign({}, EMPTY_COUNT_DATA, {
                [type]: 1
            })
            table[key] = { count, urls: [wm.url] }
        } else {
            table[key]['count'][type]++
        }

        if (!table[key]['urls'].includes(wm.url)) {
            table[key]['urls'].push(wm.url)
        }
    }

    const updateTimeSeries = (timestamp, type) => {
        if (timestamp && isKnownType(type)) {
            const day = parseInt(DateTime.fromISO(timestamp).toFormat('d'))
            const index = Object.keys(EMPTY_COUNT_DATA).findIndex(
                (t) => t === type
            )

            if (timeseries.series[index] && day) {
                let values = [...timeseries.series[index]['data']]
                values[day - 1]++
                timeseries.series[index]['data'] = values
            }
        }
    }

    const updateTweets = (wm) => {
        const matches = wm.url.match(tweetRegex)
        if (matches && matches[1]) {
            const tweetId = matches[1]
            updateTableData(tweets, tweetId, wm)
        }
    }

    const flagAsSpam = (wm, blockedDomain) => {
        if (!wm.content) {
            return
        }
        if (flagged.find((entry) => entry.url === wm.url)) {
            return
        }
        flagged.push({
            ...wm,
            blockedDomain
        })
    }

    data.forEach((wm) => {
        const source = new URL(wm['url'])
        const target = new URL(wm['wm-target'])
        const type = wm['wm-property']
        const timestamp = wm['wm-received']
        const blockedDomain = BLOCKLIST.find((domain) =>
            wm['url'].includes(domain)
        )

        updateCounts(type)
        updateTableData(sources, source.hostname, wm)
        updateTableData(targets, target.pathname, wm)
        updateTimeSeries(timestamp, type)

        if (wm['url'].includes('twitter.com')) {
            updateTweets(wm)
        }
        if (blockedDomain) {
            flagAsSpam(wm, blockedDomain)
        }
    })

    return {
        count: counts,
        sources: sortEntries(sources),
        targets: sortEntries(targets),
        tweets: sortEntries(tweets),
        flagged,
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
    const now = DateTime.utc()

    const dataByMonth = Object.keys(grouped).map((slug) => {
        const month = DateTime.fromISO(slug)
        const title = month.toFormat('MMMM yyyy')
        const from = month.startOf('month').toISODate()
        const to =
            month.endOf('month') < now
                ? month.endOf('month').toISODate()
                : now.toISODate()
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
