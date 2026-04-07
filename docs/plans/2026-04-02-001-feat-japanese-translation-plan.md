---
title: "feat: Add Japanese translation with path-prefix locale routing"
type: feat
status: completed
date: 2026-04-02
origin: docs/brainstorms/2026-04-02-japanese-translation-requirements.md
---

# feat: Add Japanese translation with path-prefix locale routing

## Overview

Add Japanese language support to The Ruby Passport's 4 public pages using Rails i18n with path-prefix routing (`/ja/...`). All hardcoded English strings will be extracted to YAML locale files, a language switcher added to navigation, and Japanese translations generated via AI.

## Problem Frame

The site will be used at an upcoming Japanese Ruby event. Japanese-speaking attendees need the content in their language. Currently all ~150-180 strings are hardcoded English in ERB templates with zero i18n infrastructure. (see origin: docs/brainstorms/2026-04-02-japanese-translation-requirements.md)

## Requirements Trace

- R1. Path-prefix locale routing (`/ja/...` for Japanese, `/` for English default)
- R2. English as default locale; no auto-detection
- R3. Locale YAML files: `config/locales/en.yml` and `config/locales/ja.yml`
- R4. Extract all hardcoded strings from public views into `t()` helpers, including `content_for(:title)`
- R5. Translate 4 public pages: home, organizer guide, organizer checklist, stamp samples
- R6. Translate shared navigation and footer content
- R7. Generate Japanese translations via AI without human review
- R8. Visible language switcher in navigation ("EN | 日本語")
- R9. Language switcher preserves current page when switching locales

## Scope Boundaries

- Auth routes (`resource :session`, `resources :passwords`) stay outside locale scope — English only
- Avo admin (`mount_avo`) stays outside locale scope — English only
- Mailer emails stay English only
- No browser language auto-detection
- No additional languages beyond Japanese
- No database-stored translations — all static YAML

## Context & Research

### Relevant Code and Patterns

- **Routes:** 4 public `get` routes served by `HomeController`, all using named helpers (`root_path`, `organizer_path`, `organizer_checklist_path`, `stamp_samples_path`)
- **Controllers:** `ApplicationController` includes `Authentication`, sets `allow_browser`. `HomeController` has 4 empty action methods with `allow_unauthenticated_access`
- **Navigation:** `app/views/layouts/_navigation.html.erb` — shared partial with desktop + mobile nav links using path helpers
- **Footer:** Duplicated inline in each of the 4 public views — not a shared partial. All contain "Made with heart for the Ruby community"
- **Hardcoded links:** Two `href="/"` in organizer and stamp_samples footers — must become `root_path`
- **JS string:** `checklist_controller.js` line 67 has `"${checked} of ${total} completed"` — needs i18n via data attribute
- **Checklist partial:** `_checklist_item.html.erb` receives `key` and `label` locals — 24 label strings hardcoded at render sites
- **Existing i18n:** Zero. No gems, no config, no `t()` calls, default `en.yml` with placeholder

### Institutional Learnings

- None — no `docs/solutions/` directory exists

## Key Technical Decisions

- **Nested keys by view** (resolves deferred R4 question): Use Rails lazy lookup convention — keys nested as `home.index.hero_title`, `home.organizer.intro`, etc. This follows Rails conventions, keeps locale files organized by page, and makes `t('.hero_title')` shorthand work in views
- **No `rails-i18n` gem** (resolves deferred R1 question): The site has no date/time/number formatting needs — it's pure marketing copy. Adding the gem would be unnecessary complexity
- **Extract footer to shared partial during i18n work**: The footer is duplicated across 4 views with near-identical content. Extracting to `_footer.html.erb` before i18n avoids translating the same strings 4 times
- **JS string via Stimulus value**: Pass the translated progress text template to the checklist controller via a `data-checklist-progress-template-value` attribute, avoiding a separate JS i18n system
- **AI translation workflow** (resolves deferred R7 question): After completing the `en.yml` extraction, use Claude to translate the entire file to `ja.yml`, preserving YAML structure and interpolation variables
- **Language switcher hides on English-only pages**: The switcher appears only on locale-scoped routes. Auth and admin pages have no switcher since they aren't translated

## Open Questions

### Resolved During Planning

- **Flat vs nested keys?** Nested by view using Rails lazy lookup convention (see Key Technical Decisions)
- **Need `rails-i18n` gem?** No — no date/number formatting needed for marketing copy
- **How to translate?** Generate complete `en.yml` first, then translate to `ja.yml` via AI in one pass
- **Footer duplication?** Extract to shared partial as part of i18n work
- **Switcher on auth pages?** Hidden — only shown on locale-scoped routes
- **Checklist localStorage persistence across locales?** The checklist controller uses `key` locals (e.g., `pre-newsletter`) as storage keys, not URL paths. State persists across locale switches without changes

### Deferred to Implementation

- **Exact key names**: Final YAML key naming will be determined during string extraction
- **Meta/OGP tags**: Check if any exist and need translation during implementation

## Implementation Units

- [ ] **Unit 1: i18n routing and locale infrastructure**

**Goal:** Set up path-prefix locale routing and locale detection so `/ja/...` URLs resolve correctly while auth/admin routes remain unscoped.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Modify: `config/routes.rb`
- Modify: `app/controllers/application_controller.rb`
- Test: `test/controllers/home_controller_test.rb`

**Approach:**
- Wrap the 4 public routes + root in `scope "(:locale)"` with `locale: /ja/` constraint. Keep `resource :session`, `resources :passwords`, `mount_avo`, and health check outside the scope
- Add `before_action :set_locale` in `ApplicationController` that reads `params[:locale]` and falls back to `:en`
- Add `default_url_options` method returning `{ locale: I18n.locale == :en ? nil : I18n.locale }` — this keeps English URLs clean (no `/en/` prefix) while Japanese URLs get `/ja/`
- Set `config.i18n.available_locales = [:en, :ja]` and `config.i18n.default_locale = :en` in `config/application.rb`
- Set `<html lang="<%= I18n.locale %>">` in the application layout

**Patterns to follow:**
- Existing route structure in `config/routes.rb` — simple `get` statements with named helpers

**Test scenarios:**
- Happy path: GET `/` returns 200 with English content
- Happy path: GET `/ja/` returns 200 (once translations exist, will show Japanese)
- Happy path: GET `/ja/organizer` returns 200
- Edge case: GET `/fr/` returns 404 or redirects (unsupported locale)
- Integration: `organizer_path` generates `/organizer` when locale is `:en` and `/ja/organizer` when locale is `:ja`
- Integration: Auth routes (`/session/new`) remain accessible without locale prefix
- Integration: `root_path` generates `/` for English and `/ja` for Japanese

**Verification:**
- All 4 public pages respond at both `/` and `/ja/` prefixed URLs
- Auth and admin routes work without locale prefix
- Path helpers generate locale-aware URLs

---

- [ ] **Unit 2: Extract shared components — navigation, footer partial, and language switcher**

**Goal:** Extract the footer into a shared partial, internationalize the navigation and footer strings, and add the language switcher.

**Requirements:** R6, R8, R9

**Dependencies:** Unit 1

**Files:**
- Modify: `app/views/layouts/_navigation.html.erb`
- Create: `app/views/layouts/_footer.html.erb`
- Modify: `app/views/home/index.html.erb` (replace inline footer with partial render)
- Modify: `app/views/home/organizer.html.erb` (replace inline footer + fix hardcoded `/` link)
- Modify: `app/views/home/organizer_checklist.html.erb` (replace inline footer)
- Modify: `app/views/home/stamp_samples.html.erb` (replace inline footer + fix hardcoded `/` link)
- Modify: `config/locales/en.yml`
- Test: `test/controllers/home_controller_test.rb`

**Approach:**
- Extract the common footer markup to `_footer.html.erb`. The footer has minor variations (some pages have a back link) — use a local variable to control the back link
- Replace the two hardcoded `href="/"` links in organizer and stamp_samples footers with `root_path`
- Wrap nav text ("Ruby Passport", "Home", "Organizer's Guide", "Stamp Samples") and footer text ("Made with heart for the Ruby community") in `t()` calls under `layouts.navigation.*` and `layouts.footer.*` keys
- Add language switcher to navigation partial: show "EN | 日本語" links using `url_for(locale: target_locale)` to preserve current page (avoids leaking routing params from `request.params`). Only render the switcher when the current route is locale-scoped
- Add corresponding entries to `en.yml`

**Patterns to follow:**
- Existing navigation partial structure with desktop + mobile sections

**Test scenarios:**
- Happy path: Navigation shows all link labels correctly in English
- Happy path: Language switcher link to `/ja/` appears on public pages
- Happy path: Language switcher link preserves current page path (e.g., on `/organizer` it links to `/ja/organizer`)
- Edge case: Language switcher does not appear on `/session/new` (auth page)
- Integration: Footer partial renders consistently across all 4 pages
- Integration: Back link in footer uses `root_path` (locale-aware)

**Verification:**
- All 4 public pages render the shared footer partial
- No hardcoded `href="/"` links remain
- Language switcher visible in nav on all public pages
- Switching language navigates to the locale-prefixed version of the same page

---

- [ ] **Unit 3: Extract home page strings**

**Goal:** Replace all hardcoded English strings in the home page with `t()` helper calls.

**Requirements:** R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `app/views/home/index.html.erb`
- Modify: `config/locales/en.yml`

**Approach:**
- Use Rails lazy lookup: `t('.hero_title')` resolves to `en.home.index.hero_title`
- Extract all headings, paragraphs, CTAs, step descriptions, event names/descriptions, and sponsor text
- Keep HTML structure in the template; put only text content in locale keys
- For content with inline HTML (links, bold), use `t('.key_html')` with the `_html` suffix for safe HTML interpolation
- Extract `content_for(:title)` string
- Proper nouns (event names like "Rails World", person names, URLs, email addresses) remain untranslated — use interpolation variables where they appear inline in translatable sentences

**Patterns to follow:**
- Rails lazy lookup convention (`t('.key')` in views)

**Test scenarios:**
- Happy path: Home page renders identically to current version in English
- Happy path: All visible text comes from locale file (no hardcoded English in template)
- Edge case: Content with inline HTML renders correctly via `_html` suffix keys
- Integration: `content_for(:title)` is translated and appears in browser tab

**Verification:**
- Home page at `/` renders all English content from `en.yml`
- No hardcoded English strings remain in `index.html.erb` (aside from HTML attributes and proper nouns in interpolation)

---

- [ ] **Unit 4: Extract organizer guide strings**

**Goal:** Replace all hardcoded English strings in the organizer guide page with `t()` helper calls.

**Requirements:** R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `app/views/home/organizer.html.erb`
- Modify: `config/locales/en.yml`

**Approach:**
- Same lazy lookup pattern as Unit 3
- This is the largest page (~60-70 strings) with intro, TL;DR, FAQ, what-to-do sections
- Extract all headings, paragraphs, FAQ questions/answers, step instructions
- Keep proper nouns (Adrian, Avo, event names) as interpolation variables
- Extract `content_for(:title)` string

**Patterns to follow:**
- Same pattern established in Unit 3

**Test scenarios:**
- Happy path: Organizer page renders identically to current version in English
- Happy path: All visible text comes from locale file
- Edge case: FAQ sections with multiple paragraphs render correctly
- Integration: Anchor links (`#tldr`, `#faq`, `#what-to-do`) still work after i18n extraction

**Verification:**
- Organizer page at `/organizer` renders all English content from `en.yml`
- No hardcoded English strings remain in `organizer.html.erb`

---

- [ ] **Unit 5: Extract organizer checklist strings and handle JS i18n**

**Goal:** Replace hardcoded strings in the checklist page and handle the JavaScript progress text.

**Requirements:** R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `app/views/home/organizer_checklist.html.erb`
- Modify: `app/views/home/_checklist_item.html.erb`
- Modify: `app/javascript/controllers/checklist_controller.js`
- Modify: `config/locales/en.yml`

**Approach:**
- Extract page headings, section labels, and the MC announcement script text
- Convert the 24 checklist item `label:` arguments from hardcoded strings to `t()` calls at the render site: `render "checklist_item", key: "pre-newsletter", label: t('.checklist.pre_newsletter')`
- For the JS progress string (`"${checked} of ${total} completed"`): add `static values = { progressTemplate: String }` to the checklist controller, then pass the translated template via `data-checklist-progress-template-value="<%= t('.progress_template') %>"`. In `updateProgress()`, use `this.progressTemplateValue.replace('%{checked}', checked).replace('%{total}', total)` to interpolate. The locale key value would be `"%{checked} of %{total} completed"`
- Extract `content_for(:title)` string

**Patterns to follow:**
- Existing `_checklist_item.html.erb` partial interface (keep `key` and `label` locals)
- Stimulus values pattern for passing server-rendered data to controllers

**Test scenarios:**
- Happy path: Checklist page renders identically to current version in English
- Happy path: All 24 checklist labels come from locale file
- Happy path: Progress text ("X of Y completed") displays correctly
- Edge case: Checklist state persists in localStorage across locale switches (storage keys use `key` local, not URL)
- Integration: Print and reset buttons still work after i18n changes
- Integration: Stimulus controller reads progress template from data attribute

**Verification:**
- Checklist page renders correctly with all text from locale files
- JavaScript progress counter works with the translated template
- No hardcoded English strings remain in checklist templates

---

- [ ] **Unit 6: Extract stamp samples strings**

**Goal:** Replace all hardcoded English strings in the stamp samples page with `t()` helper calls.

**Requirements:** R4, R5

**Dependencies:** Unit 2

**Files:**
- Modify: `app/views/home/stamp_samples.html.erb`
- Modify: `config/locales/en.yml`

**Approach:**
- Extract page title, intro text, stamp titles, stamp descriptions, design tips
- The 19 stamp entries each have a title and description — use structured keys like `home.stamp_samples.stamps.classic_circular.title` and `.description`
- Extract `content_for(:title)` string

**Patterns to follow:**
- Same lazy lookup pattern as Units 3-4

**Test scenarios:**
- Happy path: Stamp samples page renders identically to current version in English
- Happy path: All 19 stamp titles and descriptions come from locale file
- Edge case: Stamp descriptions with special characters render correctly

**Verification:**
- Stamp samples page at `/stamp-samples` renders all English content from `en.yml`
- No hardcoded English strings remain in `stamp_samples.html.erb`

---

- [ ] **Unit 7: Generate Japanese translations**

**Goal:** Create `ja.yml` with Japanese translations for all extracted strings.

**Requirements:** R3, R7

**Dependencies:** Units 3, 4, 5, 6

**Files:**
- Create: `config/locales/ja.yml`

**Approach:**
- Take the completed `en.yml` and translate all values to Japanese using AI
- Preserve YAML structure, key names, and interpolation variables (`%{checked}`, `%{total}`, etc.) exactly
- Keep proper nouns (event names, person names, URLs, email addresses) untranslated
- Keep `_html` suffix keys with their HTML markup intact, translating only the text content within

**Patterns to follow:**
- Mirror the exact YAML structure of `en.yml`

**Test scenarios:**
- Happy path: `/ja/` renders the home page with Japanese text
- Happy path: `/ja/organizer` renders the organizer page with Japanese text
- Happy path: All 4 pages render without missing translation errors
- Edge case: Interpolation variables (`%{checked}`, `%{total}`) render correctly in Japanese context
- Edge case: HTML content in `_html` keys renders correctly
- Integration: Language switcher on `/ja/` pages links back to English versions
- Integration: Navigation shows Japanese labels on `/ja/` pages

**Verification:**
- All 4 public pages render fully in Japanese at `/ja/` URLs
- No missing translation warnings or fallbacks to English
- Interpolation variables work correctly
- Page titles in browser tabs show Japanese text

## System-Wide Impact

- **Interaction graph:** `ApplicationController#set_locale` runs on every request via `before_action`. Path helpers across all views become locale-aware through `default_url_options`. Only public routes are affected.
- **Error propagation:** Missing translations will show `translation missing:` placeholders in development and raise in test (default Rails behavior). No error propagation across layers.
- **State lifecycle risks:** Checklist localStorage uses `key` locals (not URL paths) as storage keys, so state persists across locale switches without changes.
- **API surface parity:** No API endpoints affected. Admin panel and auth remain English-only as specified.
- **Integration coverage:** The language switcher's `url_for(request.params.merge(locale:))` approach needs verification on all 4 page types to ensure correct URL generation.
- **Unchanged invariants:** Auth flow, admin panel, mailer behavior, and all database operations are completely unaffected by this change.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| AI-generated Japanese translations may have awkward phrasing at the event | Translations can be refined post-event; key structural terms (passport, stamp, organizer) should be spot-checked |
| Missing translation keys discovered after deployment | Use `config.i18n.raise_on_missing_translations = true` in development/test to catch gaps early |
| Large `en.yml` file becomes hard to maintain | Nested-by-view structure keeps sections isolated; consider splitting into per-view locale files later if needed |
| Path helpers in views generate wrong locale URLs | `default_url_options` approach handles this globally; hardcoded `href` links are fixed in Unit 2 |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-02-japanese-translation-requirements.md](docs/brainstorms/2026-04-02-japanese-translation-requirements.md)
- Related code: `config/routes.rb`, `app/controllers/application_controller.rb`, `app/views/layouts/_navigation.html.erb`
- Related code: `app/javascript/controllers/checklist_controller.js` (JS i18n)
