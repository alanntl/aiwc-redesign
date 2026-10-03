# Developing the AIWC site

How the site is generated. Nobody editing content needs this — see the
[README](../README.md) for the site and the CMS.

## How the site is built

Every page is one file in `content/pages/` — `{ menuName, slug, order,
published, template, parent, intro, heroImage, blocks[] }`. Researchers and
partners are not separate files — they live inside the pages that show them,
and the build gives each one its own URL anyway (see [Editing](../README.md#editing)). The
build renders all of it into `_site/`, one real URL per document:

```bash
npm run build     # content/ -> _site/ (156 documents)
npm run verify    # structure, links, images, CMS coverage
npm test          # drives the researcher directory against the built HTML
npm run check     # all three
npm run serve     # build + serve on :8913
```

**`index.html` is the chrome template only** — head, CSS, header, footer. It
contains no page content. The build strips external scripts and renders every
panel from data through `src/templates.mjs`, so there is exactly one rendering
path and the CMS preview cannot drift from the real page.

### Base path — the thing to get right

There is no `CNAME`, so this is a GitHub *project* page served from
`https://aiwc2020.github.io/aiwc_website/`. Every absolute URL therefore
carries `/aiwc_website`, taken from `base` in `content/site.json`.

> There is a second, near-identical repository at `marvi-groundwater/aiwc`
> serving `marvi-groundwater.github.io/aiwc/`. It is not this site. Matching
> page copy is not evidence you are in the right repository — check the owner.

Adding a `CNAME` file switches the whole site to domain-root URLs
automatically — `loadSite()` in `src/registry.mjs` ignores `base` the moment a
`CNAME` exists. Nothing else needs changing.

To preview the project-page layout locally, serve the parent of `_site` with
`_site` linked as `aiwc_website/`, or just visit
`http://127.0.0.1:8913/aiwc_website/` after `npm run serve` from a directory
arranged that way.

## Header navigation

The header lists a handful of entries, some opening a submenu. Its shape is
`nav` in `content/site.json`:

```jsonc
"nav": [
  { "page": "about", "children": ["aiwc5"] },
  { "page": "work",  "children": ["research", "education", "training", "outreach"] },
  { "page": "people" },
  { "page": "contact", "button": true }   // drawn as the filled button
]
```

The home page is never an entry — the logo links to it. `npm run verify`
fails if a published page is missing from the header, so a new page needs a
line here (or a rule in `placeUnlistedPages` in `src/registry.mjs` that
places it automatically). The breadcrumb on a child page is derived from the
same list.

## Design rules

- **Navy, one orange, pale blue.** Deep navy (`--deep`) is the navigation
  bar, the hero veil, page heads, deep bands and the footer. Orange
  (`--orange`, 4.7:1 with white) is reserved for the one action — Collaborate
  with us and the hero button. `--accent` (sunrise orange) marks details only:
  the current menu item, rules, timeline years and dots, figures on navy;
  `--accent-ink` is its 5.4:1 text form on white. Pale blue (`--sky`) is the
  light band; warm sand (`--sand`) is the closing callout.
- **The logo's azure is never text** (`--azure`, 3.3:1 on white). Inline
  links use `--azure-ink`.
- **No motion on load.** Nothing fades, slides or counts up as you scroll.
  Movement only answers an action: a menu opening, a group expanding.
- **Background bands.** A section heading's "Background" (White, Pale blue,
  Deep blue) colours it and everything up to the next heading; consecutive
  headings with the same background share one band. Deep blue at most once
  per page — on the home page it holds "Who we are" and the timeline.
- **Long pages are read top to bottom.** A page set to "tabs" in the CMS now
  renders an "On this page" list of jump links; nothing is hidden.
- **Preview builds** set `"noindex": true` in `content/site.json`, which adds
  `<meta name="robots" content="noindex">` and a disallow-all `robots.txt`.

## Structure

```
index.html              chrome template (design system lives here)
src/
  registry.mjs          what exists: pages, people, partners, URLs, base path
  templates.mjs         every block renderer + the three page templates
  app.mjs               browser behaviour: drawer, directory filter, reveal
scripts/
  build.mjs             content/ -> _site/
  verify.mjs            structural checks
  test-directory.mjs    drives the built directory page in a DOM
  migrate/              one-time import from aiwc.org.au (provenance only)
content/
  site.json             name, URL, base path, languages
  pages/*.json          15 navigable pages — people.json holds all 108
                        researchers, partners.json all 33 institutions
assets/                 portraits, logos, photography
admin/                  Sveltia CMS (config.yml is a template — see below)
```

## Translation

The build is multi-language capable — `languages` in `content/site.json` drives
it, and pages render at `/<lang>/…` with `hreflang` alternates. It currently
ships **English only**: shipping a language switcher that yields English
content would be worse than not offering one, so the switcher is removed from
the chrome whenever `languages` has a single entry.
