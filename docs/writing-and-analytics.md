# Writing and analytics

The archive, tags, selected writing, and articles use the same field-notes design
as the homepage. The notebook lists eight non-poetry articles. Poetry is omitted
from archive/topic/selected lists, related article links, and RSS; all 11 existing
article URLs remain available. `/writing/page2/` links to the notebook. Search
and topic filters enhance it progressively; without JavaScript every listed
entry remains available.

## Google Analytics 4

The obsolete Universal Analytics snippet was removed. Analytics is configured
once in `_includes/analytics.html`, shared by every page layout. It loads only
when `JEKYLL_ENV=production` and `google_analytics` contains a `G-` measurement ID.
The configured web stream is `G-SBCP6GHRZR`. GitHub Pages production builds use
this setting. Clearing the ID disables tracking.

1. In Google Analytics, create a GA4 property if you do not have one.
2. In **Admin → Data streams → Add stream → Web**, enter
   `https://anuragjain.me` and enable enhanced measurement as desired.
3. Copy the public **Measurement ID**, beginning with `G-`, into
   `google_analytics` in `_config.yml`.
4. Deploy, visit the site, and check the GA4 Realtime report. Verify a page view
   on the homepage, writing archive, and an article. Browser tracking protection
   or an ad blocker can prevent a test visit from appearing.

No Google account credentials belong in this repository. Browser checks using a
test ID verified initialization across all layouts. A separate check loaded the
real Google tag through TLS-verified transport and submitted a test `page_view`
for `G-SBCP6GHRZR`; the collector returned HTTP 204. This demonstrates collector
acceptance, not receipt visible in the property's Realtime report.

## Blog and Medium migration

On 10 October 2026 both sources returned HTTP 403, Cloudflare error 1010, from the
cloud environment. No external stories have been imported yet. Keep the existing
blog and Medium destinations online until a complete inventory is verified.

Medium: **Settings → Security and apps → Download your information** provides an
export ZIP with published story HTML. For another blog platform, obtain a full
RSS content export. A recent-post RSS feed may omit older stories; it is not
proof that a migration is complete.

Preview the export before writing:

```sh
python3 tools/import_writing.py /path/to/medium-export.zip --platform Medium
python3 tools/import_writing.py /path/to/full-blog-feed.xml --platform Blog
```

Then import reviewed entries and their images:

```sh
python3 tools/import_writing.py /path/to/medium-export.zip --platform Medium --apply --download-images
```

The importer preserves dates and source URLs, skips matching titles or URLs,
ignores drafts, strips active HTML, downloads raster images, and refuses to
overwrite existing posts. Image fetches require access to the source image host.
A failure leaves that story unwritten; earlier successful imports can be retried
without duplication. Imported source labels appear in the archive and article.
Scripts and embedded widgets are removed: review code, formatting, illustrations,
and links after importing. Export HTML tags are not supplied by Medium; review
and add topic tags after import. This tool accepts RSS 2.0 full-content feeds and
Medium ZIP exports, not summary-only feeds or arbitrary website scraping.

Compare the export inventory against the original sources, deduplicate stories
cross-posted on both platforms, and verify every article and image before calling
the migration complete. Do not redirect the blog subdomain until its old URL
mapping is known and redirects have been prepared.
