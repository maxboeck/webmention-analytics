const { DateTime } = require('luxon')

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

    obfuscate: function (str) {
        const chars = []
        for (var i = str.length - 1; i >= 0; i--) {
            chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
        }
        return chars.join('')
    },

    pprint: function (obj) {
        return JSON.stringify(obj, null, 2)
    },

    slice: function (arr, start, end) {
        return end ? arr.slice(start, end) : arr.slice(start)
    }
}
