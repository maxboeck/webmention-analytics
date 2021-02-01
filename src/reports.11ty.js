const analytics = require('../utils/analytics.js')

module.exports = class {
    data() {
        return {
            layout: 'report',
            permalink: ({ report }) => `/${report.slug}/index.html`,
            pagination: {
                data: 'webmentions.children',
                size: 1,
                alias: 'report',
                resolve: 'values',
                before: analytics
            }
        }
    }

    render() {
        // render logic handled by layout template
        return ''
    }
}
