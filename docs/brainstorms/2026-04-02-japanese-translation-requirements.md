---
date: 2026-04-02
topic: japanese-translation
---

# Japanese Translation for The Ruby Passport

## Problem Frame

The Ruby Passport site will be used at an upcoming Japanese Ruby event. Japanese-speaking attendees need to understand the site content — how the passport works, how organizers participate, and how to use stamps. All content is currently hardcoded English strings in ERB templates with zero i18n infrastructure.

## Requirements

**i18n Infrastructure**

- R1. Add Rails i18n with path-prefix locale routing (`/ja/...` for Japanese, `/` for English default)
- R2. English remains the default locale; no auto-detection
- R3. Locale YAML files: `config/locales/en.yml` and `config/locales/ja.yml`
- R4. Extract all hardcoded strings from public-facing views into `t()` helper calls, including page titles (`content_for(:title)`)

**Translation Scope**

- R5. Translate the 4 public pages: home, organizer guide, organizer checklist, stamp samples
- R6. Translate shared navigation and footer content
- R7. Generate Japanese translations via AI without human review pass

**Language Switcher**

- R8. Add a visible language switcher in the site navigation (e.g. "EN | 日本語")
- R9. Language switcher preserves the current page when switching locales

## Success Criteria

- Japanese visitors to `/ja/` see fully translated public pages
- English site at `/` is unaffected
- Switching languages preserves page context
- All public-facing strings extracted to locale files (no hardcoded English remaining in translated views)

## Scope Boundaries

- Auth screens (login, signup, password reset) stay English-only — auth routes must remain outside the locale scope block
- Admin panel (Avo) stays English-only — Avo mount must remain outside the locale scope block
- Mailer emails stay English-only
- No browser language auto-detection
- No additional languages beyond Japanese in this pass
- No database-stored translatable content (all static YAML)

## Key Decisions

- **Path prefix over subdomain**: Simpler to implement, no DNS config, standard Rails i18n pattern
- **AI translation without review**: Acceptable tradeoff for event timeline — can be refined later
- **YAML files over database-backed translations**: All content is static marketing copy, YAML keeps it simple

## Outstanding Questions

### Deferred to Planning

- [Affects R4][Technical] Best strategy for extracting ~200-300 strings — flat keys vs. nested by view?
- [Affects R1][Technical] Whether to use `rails-i18n` gem for Japanese locale defaults (date/time/number formats)
- [Affects R7][Needs research] Optimal approach for generating AI translations of the YAML content

## Next Steps

→ `/ce:plan` for structured implementation planning
