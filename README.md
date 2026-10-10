# anuragjain67.github.io
Blog, Learnings, Poem etc.

# Quick start
(If you want this theme)

1. Use Git to clone this repo
2. Make sure you have [Jekyll](http://jekyllrb.com/docs/installation/) installed
3. Just the first time: `bundle install`
4. To build the site and serve it: `bundle exec jekyll serve`
5. To test: `http://localhost:4000`

# Through Docker 
docker-compose up -d

# Visual homepage

The homepage uses the `portfolio` layout, local fonts, and field-notes illustrations.
Its MAPF demonstration opens with coordinated paths, with congestion and deadlock
examples also available. The deadlock walkthrough shows two robots waiting for
each other's occupied cell in a single-lane aisle. Use **Resolve deadlock** to
watch A back into a passing bay, let B pass, and continue to its original goal.
Reduced motion keeps the walkthrough manual with Advance or Step.
The decomposition diagram uses generic service boundaries;
neither visual represents a production system or measured company results.

Run the schedule checks with Node.js (18 or later):

```sh
node --test tests/mapf-demo.test.cjs
```

Build and serve with the Jekyll commands above. For UI changes, also check the
scenario controls, play/pause/reset, deadlock recovery, keyboard navigation, reduced motion, and
mobile layout in a browser. The existing writing archive and RSS should still work.

Repository-local guidance is available for
[Codex](.agents/skills/visual-portfolio/SKILL.md) and
[Claude Code](.claude/skills/visual-portfolio/SKILL.md).
Tests, agent skills, and the design QA report are excluded from the public site.
Local font licenses are retained under `assets/fonts/portfolio/`.

# Writing and analytics

The notebook shares the homepage layout and offers search and topic filters.
Poetry is omitted from the notebook, topic lists, related notes, and RSS;
individual poems retain their existing URLs. Articles retain their original
URLs and Disqus discussion IDs. Comments
load on demand. The AJ favicon uses the site's ivory and forest-green palette.

See [writing and analytics setup](docs/writing-and-analytics.md) for GA4 activation
and the export-based blog/Medium importer. GA4 is configured with the supplied
measurement ID `G-SBCP6GHRZR`; confirm live collection in its Realtime report.
External content migration requires a full export while the source hosts block
cloud access. No sample articles have been added to the public archive.

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
```

# Technologies
1. Built with [Jekyll](http://jekyllrb.com/). This website is completely static
   and I use basic HTML or Markdown for everything.
2. Hosted on [GitHub Pages](https://pages.github.com/). I'm using the 
   [GitHub Pages Gem](https://help.github.com/articles/using-jekyll-with-pages/)
   and only Jekyll plugins that are 
   [available on GitHub Pages](https://help.github.com/articles/repository-metadata-on-github-pages/).

See the [Jekyll](http://jekyllrb.com/) and [GitHub Pages](https://pages.github.com/)
documentation for more info.


# License
This code is released under the MIT License. See LICENSE.txt.

# Thankyou:
[Yevgeniy](https://github.com/brikis98/yevgeniy-brikman-homepage) for this awesome Jekyll Theme.

