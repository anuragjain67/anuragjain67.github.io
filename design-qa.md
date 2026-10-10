# Portfolio design QA

final result: passed

## Evidence

- Source visual truth: `/workspace/generated_images/exec-f6ee001b-ca2a-4dbd-b127-b3ed7b283a0a.png` (selected option 2).
- Browser-rendered desktop implementation: `/tmp/portfolio-desktop-final.png`.
- Browser-rendered mobile implementation: `/tmp/portfolio-mobile-final.png`.
- Combined full-view comparison: `/tmp/portfolio-comparison-final.png`.
- Focused hero comparison: `/tmp/portfolio-hero-comparison.png`.
- Focused demo comparison: `/tmp/portfolio-demo-comparison.png`.
- Focused implementation captures: `/tmp/portfolio-hero-final.png`, `/tmp/portfolio-demo-final.png`.
- Functional browser check results: `/tmp/portfolio-checks.json`.

Desktop viewport: 1440 × 1000 CSS pixels, deviceScaleFactor 1. Full page is
1440 × 2983 pixels. Source is 946 × 1663 pixels; both images were normalized to
720 pixels wide with proportional heights for the combined comparison. Focused
regions were normalized to equal widths without stretching. Mobile viewport:
390 × 844 CSS pixels, deviceScaleFactor 1. State: homepage, congestion selected,
paused at step 0. CSS transitions were allowed to settle before final capture.

## Comparison history

Initial combined evidence: `/tmp/portfolio-comparison-v1.png`.

1. P2: Raster illustrations had tinted rectangular paper backgrounds that
   differed from the continuous page surface. Fixed by generating transparent
   versions preserving the graphite drawing, routes, labels, and colored shading.
   The final captures show the illustrations integrated with the ivory page.
2. P2: Desktop display typography and supporting text were smaller than the
   selected editorial hierarchy. Increased the hero and section headings,
   supporting text, and left story column. Mobile heading sizes remain responsive.
   The focused hero and full-page recaptures show the corrected hierarchy.

No actionable P0/P1/P2 findings remain after the revised combined comparison.

## Required fidelity surfaces

- Fonts and typography: self-hosted Lora serif headings/body and DM Sans for
  navigation/controls match the editorial serif/sans pairing. Three-line hero and
  two-line section headings remain readable. Local font licenses are preserved.
- Spacing and layout rhythm: two columns, numbered sections, rule separators,
  generous section padding, and warm open page surface follow the reference.
  Mobile stacks the content with no clipped controls or horizontal scrolling.
- Colors and tokens: ivory `#f8f5ed`, forest green `#184c39`, graphite `#171d18`,
  muted rules, and amber accents retain the chosen direction. Selected controls
  have a clear green state; visible keyboard focus uses amber.
- Image quality: generated raster illustrations preserve the reference's
  hand-drawn subject matter and pencil detail. Their transparent WebP versions
  blend into the page without paper panels. No static reference illustrations
  were replaced by code-drawn art. The canvas is a live data visualization of
  actual illustrative schedules, rather than an illustration substitute.
- Copy/content: MAPF leadership appears before title and experience. Congestion,
  deadlock resolution, and navigation efficiency are described as software work.
  Decomposition has its own prominent section. Client names, team sizes,
  performance percentages, and customer-facing SaaS descriptions are absent.

## Intentional implementation differences

The reference shows a static mid-scenario simulation image. The implementation
starts at step 0 and runs real, checked illustrative schedules. It includes agent
letters and a legend, a step button, scenario explanations, and playback status
for accessibility. These additions increase the MAPF section's height. There is
no claim that the example is GreyOrange's production planner or optimal MAPF.

The About section retains the user's approved career details and education, so
it is longer than the design concept. The architecture diagram is explicitly
conceptual with generic service labels. Existing writing routes remain available through the shared navigation and
footer. The notebook now uses the same design as the homepage.

## Validation

- Jekyll build passed.
- Six Node schedule tests passed: no shelf/boundary violations, invalid steps,
  shared-cell collisions or opposing swaps; congestion includes waiting and
  eventual arrival; deadlock stays unresolved; coordination reaches every goal.
- Chromium browser: scenario toggles, selected states, matching agent legend,
  play/pause, completion/replay, step, reset while playing, and keyboard playback.
- Reduced-motion preference switches playback to manual advancement.
- No-JavaScript page retains illustration, explanatory content, and navigation.
- No horizontal overflow at widths 320, 390, 768, 1024, and 1440.
- No homepage JavaScript errors or failed asset requests.
- Writing archive, tags, popular posts, original CSS and RSS returned HTTP 200;
  RSS contains 10 entries.
- Internal skills, tests, and this report returned HTTP 404 on the public server
  after restarting it to apply the Jekyll exclusion configuration.

## Implementation checklist

- [x] Fix the initial P2 findings and recapture.
- [x] Compare full page and focused regions alongside the visual target.
- [x] Verify functional interactions, mobile layout, and accessible alternatives.
- [x] Preserve existing routes and public-content boundaries.

## Follow-up polish

P3: Generated pencil marks and service-label placement differ slightly from the
concept image; subject, legibility, and art direction are preserved. Validation
used Chromium; other browser engines were not exercised. No automated check
replaces a full assistive-technology audit.


## Writing and AJ icon iteration — 10 October 2026

final result: passed

The selected field-notes direction remains the visual reference. The writing
page uses the homepage's colors, local serif/sans fonts, shared navigation,
thin rules, open spacing, and existing landscape illustration. Its article
list and reading column are adaptations to editorial content, not replacements
for the homepage's interactive work explanations.

Evidence inspected:

- Homepage and writing at matching 1440 × 1000 viewports:
  `/tmp/home-writing-comparison.png`.
- Complete desktop/mobile writing captures: `/tmp/writing-desktop-final.png`,
  `/tmp/writing-mobile-final.png`.
- Complete desktop/mobile long article captures: `/tmp/article-desktop-final.png`,
  `/tmp/article-mobile-final.png`.
- Original writing capture: `/tmp/writing-before.png`.
- Generated AJ source asset:
  `/workspace/generated_images/exec-f0a097bc-1048-4f14-b4f8-8e9823348641.png`.
- AJ exports at native small sizes: `/tmp/aj-icon-sizes.png`.
- Browser results: `/tmp/writing-checks.json`.
- Real GA4 collector test: `/tmp/ga4-live-checks.json`.

No actionable P0/P1/P2 visual findings remain. The archive stacks controls and
metadata on mobile, preserves readable titles and body copy, and keeps links
and keyboard focus visible. AJ is readable at 16 px; new icon filenames avoid
the previous browser favicon cache. The reading sidebar appears for articles
with several headings and is omitted on mobile, where the original article's
own contents and headings remain available.

Verified: all 11 existing entries, 3 poetry entries, 8 notes, case-insensitive
search, topic/type filters, empty results and clear actions, filter restoration
from URLs, topic fragment links, article contents links, all old article routes,
legacy archive page 2, keyboard access, JavaScript-free reading, and no horizontal
overflow at 320/390/768/1024/1440 px for the archive and 320/390/1440 px for all
articles and related pages. No local failed assets or browser JavaScript errors
occurred. Comment loading was checked against a mock Disqus response with the
original identifier shape; live stored discussions remain outside that check.

Build passed. Seven importer checks and six MAPF schedule checks passed. GA4 was
checked for one initialization across five production page types using a mock
ID. A separate check used the real Google tag and supplied stream ID through
TLS-verified HTTP transport: Google accepted a `page_view` for the writing URL
with HTTP 204. The property's Realtime report still requires account access.

External blog/Medium migration is blocked by source HTTP 403 (Cloudflare 1010),
not by a UI defect. No source content was fabricated or silently claimed as
imported. The export-based importer and review instructions are prepared. Likes
have not been added; the existing Disqus integration is retained for comments.

## Personal homepage introduction

The user requested a personal portfolio introduction instead of a product-like
headline. The hero now says “Hi, I’m Anurag. I work on software for robot fleets.”
The next paragraph explicitly says he is currently leading MAPF at GreyOrange,
followed by title and experience. The button says “Explore my work.” This copy
change takes precedence over the original reference headline.

An initial desktop capture wrapped the middle sentence across two lines. The
hero heading size was adjusted to retain the intended three-line introduction.
Final desktop/mobile evidence: `/tmp/personal-hero-desktop.png` and
`/tmp/personal-hero-mobile.png`. The heading, current-work wording, and CTA were
checked at 320/390/768/1024/1440 px; no horizontal overflow. Production build
passed after the change. No actionable P0/P1/P2 issues remain.

## Concise homepage summary

The hero now uses only “Hi, I’m Anurag.” as its heading. Current MAPF leadership
at GreyOrange leads the introduction, followed by backend engineering,
architecture, and team leadership with Python, Erlang, and Elixir emphasized.
Title and experience follow the work summary. The repeated backend/languages
paragraph was moved from About to the hero; About retains mentoring and career
background. This replaces the previous “I lead software for robot fleets” line
at the user's request.

Final evidence: `/tmp/hero-summary-1440.png` and `/tmp/hero-summary-390.png`.
The updated copy, language emphasis, single heading, and layouts were checked
at 320/390/768/1024/1440 px with no horizontal overflow or JavaScript errors.
Production build passed. No actionable P0/P1/P2 issues remain.

## Poetry hidden from the notebook

At the user's request, poetry is excluded while rendering the writing archive,
topic lists, selected writing, related-note navigation, and RSS. The archive now
shows eight non-poetry entries. The poetry/type filter and poetry promotional
copy were removed; search and topic/source filtering remain available. Existing
poem pages and discussion identifiers are retained.

Evidence: `/tmp/writing-no-poetry-1440.png` and
`/tmp/writing-no-poetry-390.png`, after clearing filters with search focused.
Checked server-rendered exclusions and RSS counts, legacy `?kind=Poetry` cleanup,
search/topic/empty/clear controls, eight entries without JavaScript, preserved
poem URLs, and no overflow at 320/390/768/1024/1440 px. No browser JavaScript
errors occurred. The first URL check incorrectly compared CSS-uppercase
innerText to mixed case; checking the actual text content confirmed all three
poem labels and pages remained intact. Production build passed.
No actionable P0/P1/P2 issues remain.
