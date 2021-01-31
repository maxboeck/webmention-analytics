const analytics = require('../utils/analytics.js')

module.exports = class {
    data() {
        return {
            layout: 'base',
            permalink: (dataset) => `/${dataset.slug}/index.html`,
            pagination: {
                data: 'webmentions',
                size: 1,
                alias: 'dataset',
                before: analytics
            }
        }
    }

    render({ dataset }) {
        return JSON.stringify(dataset, null, 2)
    }
}
