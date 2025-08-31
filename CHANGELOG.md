# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.0.0] - 2025-08-31

Initial stable release of SmoothJS.

Highlights:
- Core runtime and composition
  - Keyed reconciliation for lists; minimal DOM/text/attribute diffing.
  - Error boundaries with renderError + global error event for DevTools overlay.
  - Composition primitives: props/children, context providers/consumers, and portals.
- SSR + Hydration
  - SSR.renderToString for server rendering; Component.hydrate() for client attachment.
  - Example page (examples/ssr.html) with dark-mode-aware pre-hydration styling.
- Router
  - Nested routes with router outlets, dynamic params, lazy routes, link helper with active class.
  - Route guards (beforeEach) supporting redirects.
- Data Query Layer
  - Caching with staleTime/cacheTime, request dedupe, subscribe/invalidate/refetch.
  - SWR mode, focus/reconnect revalidation, tag invalidation, and mutations with optimistic updates + rollback.
- Design System (Velvet)
  - CSS-in-JS engine with deterministic hashing, global cache, and batched style injection.
  - UI components: Button, Input, Modal (with focus trap), Tabs; utilities and theme tokens.
- A11y utilities
  - focusTrap, live-region announce, skip links, and ARIA helpers.
- Testing utilities
  - mount/render helpers, event fire, wait/waitFor/tick/act, and test-id queries.
- Security and Forms
  - Sanitization helper for unsafe HTML; simple createForm helpers (values/errors/touched/dirty and handlers).
- DevTools
  - Optional runtime error overlay; timing helper; debug flag.
- Examples
  - Rich demo app (examples/) including routing, data fetching/mutations, composition, design system, forms, SSR.
- Performance
  - Event delegation in components; microtask batching for updates; optimized Velvet style injection.

Docs:
- See docs/roadmap.md for the full feature breakdown and phased milestones (1–7), all marked completed.

Breaking changes:
- None relative to the last pre-1.0 repository state; this codifies APIs as stable for 1.x.

## [Unreleased]
- Planned enhancements will be tracked here.
