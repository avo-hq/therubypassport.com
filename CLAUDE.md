# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Ruby Passport (therubypassport.com) — a Rails 8.1 marketing/content site with authentication and an Avo admin panel. Ruby 3.4.5, PostgreSQL, Tailwind CSS v4, esbuild, Hotwire (Turbo + Stimulus).

## Common Commands

```bash
# Development server (uses overmind to run Rails + JS + CSS watchers)
bin/dev

# Database
bin/rails db:create db:migrate
bin/rails db:reset          # drop + create + migrate + seed

# Tests
bin/rails test              # all tests
bin/rails test test/models/user_test.rb              # single file
bin/rails test test/models/user_test.rb:10           # single test by line
bin/rails test:system       # system tests (Capybara + Selenium)

# Linting & security
bin/rubocop                 # Ruby style (rails-omakase)
bin/brakeman                # security static analysis
bin/bundler-audit           # gem vulnerability audit

# Assets
yarn build                  # JS via esbuild
bun run build:css           # CSS via Tailwind CLI
```

## Architecture

- **Frontend**: Tailwind CSS v4 (`app/assets/stylesheets/application.tailwind.css`), esbuild for JS bundling, Hotwire (Turbo + Stimulus). Propshaft for asset pipeline.
- **Admin**: Avo v3 mounted at `/avo` — resources live in `app/avo/resources/`.
- **Auth**: Rails 8 built-in authentication (sessions + passwords controllers, `has_secure_password` on User).
- **Background jobs**: Solid Queue. Caching via Solid Cache. WebSockets via Solid Cable.
- **Database**: PostgreSQL. Production uses separate databases for cache, queue, and cable.
- **Models**: User and Session (standard Rails auth models).
- **Routes**: Root is `home#index`. Public pages: `/organizer`, `/stamp-samples`. Session/password resources for auth. Avo admin mounted.

## Stamp Samples Gallery

The stamp samples page (`/stamp-samples`) displays images in **reverse-chronological order** — newest stamps go first, like a feed. When adding new stamp images:

1. Drop the image files into `app/assets/images/samples/`
2. Run `bin/compress-samples` to compress them (requires ImageMagick and ffmpeg)
3. Add locale entries in `config/locales/home/stamp_samples.en.yml`
4. Add the card markup at the **top** of the grid in `app/views/home/stamp_samples.html.erb`

## Design Guidelines

See `agents.md` for the full design style guide. Key points:
- Basecamp-inspired: minimal, clean, generous whitespace, conversational copy
- Color palette: Deep Blue (#1D2D35), Warm Yellow (#FFD84D), Clean White, Soft Gray (#F5F5F5)
- Large readable body text (18-20px), max content width ~680px
- Mobile-first, accessible, semantic HTML
