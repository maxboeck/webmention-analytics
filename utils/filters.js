const { DateTime } = require('luxon')
const URL = require('url-parse')
const { orderBy } = require('lodash')
const sanitizeHTML = require('sanitize-html')

module.exports = {
    dateToFormat: function (date, format = 'dd.MM.yyyy') {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(
            String(format)
        )
    },

    dateToISO: function (date) {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
            includeOffset: false,
            suppressMilliseconds: true
        })
    },

    dateFromISO: function (timestamp) {
        return DateTime.fromISO(timestamp, { zone: 'utc' }).toJSDate()
    },

    commonURLs: function (urls) {
        if (urls.length === 1) {
            return urls
        }
        const urlmap = {}
        urls.forEach((str) => {
            const { protocol, hostname, pathname } = new URL(str)
            const url = protocol + '//' + hostname + pathname
            urlmap[url] = urlmap[url] ? urlmap[url] + 1 : 1
        })
        const indexed = Object.keys(urlmap).map((key) => ({
            url: key,
            count: urlmap[key]
        }))
        const ordered = orderBy(indexed, (i) => i.count, 'desc')
        return ordered.map((i) => i.url)
    },

    cleanWebmention: function (wm) {
        const allowedHTML = {
            allowedTags: ['b', 'i', 'em', 'strong', 'a'],
            allowedAttributes: {
                a: ['href']
            }
        }
        const clean = (entry) => {
            const { html, text } = entry.content
            if (html) {
                // really long html mentions, usually newsletters or compilations
                entry.content.value =
                    html.length > 2000
                        ? `mentioned this in <a href="${entry['wm-source']}" rel="noindex nofollow">${entry['wm-source']}</a>`
                        : sanitizeHTML(html, allowedHTML)
            } else {
                entry.content.value = sanitizeHTML(text, allowedHTML)
            }
            return entry
        }
        return clean(wm)
    },

    obfuscate: function (str) {
        const chars = []
        for (var i = str.length - 1; i >= 0; i--) {
            chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
        }
        return chars.join('')
    },

    pprint: function (obj) {
        return `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre>`
    },

    slice: function (arr, start, end) {
        return end ? arr.slice(start, end) : arr.slice(start)
    }
}
