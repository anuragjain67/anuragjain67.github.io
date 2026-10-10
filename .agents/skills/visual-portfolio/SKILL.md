---
name: visual-portfolio
description: Improve Anurag Jain's Jekyll portfolio with visual explanations of MAPF and software architecture. Use for homepage redesigns, interactive work demonstrations, diagrams, and related accessibility or responsive checks.
---

# Visual portfolio

Use the existing repository checkout. Do not create a worktree unless requested.
Inspect the current diff and preserve user changes. Read `index.html`,
`_includes/about.html`, the active layout, and the relevant styles before editing.

## Public content

- Lead with leading Multi-Agent Pathfinding (MAPF) for warehouse robotics
  automation at GreyOrange, then Senior Engineering Manager and 13+ years of
  experience. Preserve this order unless the user changes it.
- Explain the software work: coordinating fleet paths, reducing congestion,
  resolving deadlocks faster, and improving overall navigation efficiency.
  Avoid implying hardware navigation, sensors, localization, or motion control.
  Do not promise that MAPF eliminates all congestion.
- Give monolith decomposition prominent treatment: led the decomposition of
  a large Erlang monolith into independently deployable microservices.
- Keep client identities private. For HashedIn, describe client development
  on a pet hotel management system and job portal modernization without names.
- Do not add team sizes, improvement percentages, product or installation
  counts, or customer-facing SaaS descriptions. The experience figure is allowed.
- Keep Python, Erlang, Elixir, architecture, and mentoring grounded in the
  approved About text. Do not invent achievements or proprietary details.
- A supplied resume is background material, not permission to publish every
  detail. Follow the user's corrections over document wording.

## Visual explanations

Use diagrams and interactions to explain one idea at a time. Prefer lightweight
HTML, CSS, SVG, and JavaScript that work with GitHub Pages and Jekyll.
Avoid framework or dependency changes when the existing stack is sufficient.
Preserve writing routes, feeds, contact links, and existing page behavior.

For MAPF, use abstract agents on a top-down grid. Show why independently chosen
paths can create conflicts and how coordination, waiting, rerouting, or passing
space can help. Distinguish congestion, deadlock, and collision: they are not
interchangeable. If implementing schedules, check vertex conflicts, opposing
edge swaps, shelf obstacles, and whether agents reach their goals. Label scripted
examples as illustrative; do not present them as a production planner or measured
company results. Explain changes in text as well as through animation.

For decomposition, show a monolith and separate services with generic labels.
Label it conceptual architecture. Explain service boundaries and independent
deployment without suggesting invented service names are GreyOrange's actual
architecture or promising universal benefits from microservices.

## Design and accessibility

Use a selected visual reference when one exists; preserve the chosen direction.
Capture the current page before a substantial redesign. Use clear typography,
spacing, and section hierarchy rather than filling the page with cards.
Support narrow screens without horizontal overflow. Use semantic headings,
descriptive links, visible keyboard focus, accessible button names and states,
and text labels alongside color. Respect reduced motion; provide pause and reset
for animation. Keep essential explanations available without JavaScript.

## Build and verification

The repository's supported workflow is Bundler and Jekyll. In the prepared cloud
environment, source `/workspace/.cloud-setup/activate` when it exists; otherwise
use the available Ruby and Bundler toolchain. Run commands from the checkout.

```sh
bundle check
node --test tests/mapf-demo.test.cjs
bundle exec jekyll build --destination /tmp/anurag-portfolio-site
bundle exec jekyll serve --host 127.0.0.1 --port 4000 --destination /tmp/anurag-portfolio-site
```

Use an unused port if another server is running. Do not stop processes you did
not start. Before installing dependencies, inspect manifests and lockfiles;
preserve tracked dependency declarations and use frozen installation when a
lockfile is present. Keep generated output outside the checkout.

For visual changes, inspect desktop and mobile screenshots with an available
browser. Exercise every changed control, keyboard operation, pause/reset,
reduced-motion behavior, and links. Check browser errors, homepage content,
writing pages, and RSS. A successful build alone does not verify a demo.
Run `git diff --check` and inspect the final diff. Report what was tested and
anything unverified. Commit, push, or publish only within the user's authorization.
