# Webmention Analytics

An analytics dashboard for webmention.io data.

[![Netlify Status](https://api.netlify.com/api/v1/badges/758f580e-b9ec-44f6-a23d-1176389c989a/deploy-status)](https://app.netlify.com/sites/webmention-analytics/deploys)  

## Features

* Group data by month
* Overview of incoming webmentions by day
* Support for 5 types of webmentions (likes, replies, reposts, mentions, bookmarks)
* Top sources sending webmentions to your site
* Top targets on your site receiving webmentions
* Top tweets generating webmentions through brid.gy
* Webmentions flagged as spam (domains on a blocklist)
* Automatic daily updates

## Get your own instance

Things you may need:

* a Github account
* a Netlify account
* a site registered on [webmention.io](https://webmention.io)
* backfeed of Twitter via [brid.gy](https://brid.gy) (optional)

The easiest way to get started is to fork this repo and deploy it to a new Netlify site:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/maxboeck/webmention-analytics) 

### 1. Edit Settings

Open `src/data/meta.json` and edit it to fit your site. Adjust the `url` to the URL of your Netlify deployment and the `domain` to match the domain of your webmention.io account.

### 2. Set Webmention Token

To fetch webmention.io data, you need to [set a new environment variable](https://docs.netlify.com/configure-builds/environment-variables/) called `WEBMENTION_IO_TOKEN` in your Netlify site admin. You can find this token on your webmention.io [settings page](https://webmention.io/settings) under "API Key".

### 3. Configure Build Hook

You can configure Github to periodically trigger a new build of the dashboard, fetching up-to-date webmention data. First, set up a new [Netlify Build Hook](https://docs.netlify.com/configure-builds/build-hooks/) in your site admin. It will look something like this:

`https://api.netlify.com/build_hooks/12345f83c31475e31000`

Copy it to your clipboard. Then go to your forked repository's settings page and add it as a new [repository secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository) called `NETLIFY_CRON_BUILD_HOOK`.





