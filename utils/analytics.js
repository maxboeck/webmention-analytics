const URL = require('url-parse')
const { orderBy, groupBy } = require('lodash')
const { DateTime } = require('luxon')

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

function parseEntries(data) {
    const totalCount = data.length
    const typeCount = {
        'like-of': 0,
        'in-reply-to': 0,
        'repost-of': 0,
        'mention-of': 0,
        'bookmark-of': 0
    }

    const targets = {}
    const sources = {}

    const addSource = (name, type, url) => {
        if (!sources[name]) {
            sources[name] = {
                count: {},
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

    const addTarget = (name, type, url) => {
        if (!targets[name]) {
            targets[name] = {
                count: {},
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

    const addCount = (type) => {
        if (typeof typeCount[type] === 'number') {
            typeCount[type] = typeCount[type] + 1
        }
    }

    data.forEach((wm) => {
        const source = new URL(wm['wm-source'])
        const target = new URL(wm['wm-target'])
        const type = wm['wm-property']

        addSource(source.hostname, type, wm['wm-source'])
        addTarget(target.pathname, type, wm['wm-source'])
        addCount(type)
    })

    return {
        count: {
            total: totalCount,
            ...typeCount
        },
        sources: sortEntries(sources),
        targets: sortEntries(targets)
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
        const data = parseEntries(grouped[slug])
        const month = DateTime.fromISO(slug)

        const title = month.toFormat('MMMM yyyy')
        const from = month.startOf('month').toISODate()
        const to = month.endOf('month').toISODate()
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
