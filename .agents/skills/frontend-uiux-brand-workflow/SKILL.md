---
name: frontend-uiux-brand-workflow
description: 'Design and implement frontend UI/UX features for this EduNet project with a senior-level workflow. Use when building new pages/components, refactoring UI, reviewing UX, or generating implementation-ready code with text-font rules [11-12] and shared app.css tokens.'
argument-hint: 'Feature or page goal, target users, and constraints'
---

# Frontend UI/UX Brand Workflow

## What This Skill Produces

- A clear UI implementation plan and component breakdown.
- Production-ready React/Vite/Tailwind-compatible UI aligned with project visual language.
- UX validation notes that cover accessibility, responsiveness, and interaction quality.

## When to Use

- Build a new page, section, or component.
- Refactor an existing screen for clearer UX and better conversion.
- Review a UI implementation before merge.
- Turn product requirements into practical interface structure and interactions.

## Default Brand Direction

- Text-state-500 primary: `#30C2EC`
- Text-state-500 secondary: `#00B1F5`
- Supporting text colors: white `#FFFFFF` and light orange `#FFC069`
- Keep text-font colors restricted to the four approved values above.
- Store and reuse these colors from `src/assets/styles/app.css` shared variables.
- Use `src/assets/styles/app.css` only for shared/global CSS (tokens, reset, utilities).
- Place page-specific/component-specific selectors in dedicated local CSS files and import those files from the related page/component.
- Prefer a modern, energetic look with strong information hierarchy.

## Workflow

1. Clarify intent and constraints
- Identify the user goal, primary action, and success state.
- Confirm device priority: mobile-first, desktop-first, or balanced.
- Capture hard constraints: API data shape, latency, localization, and release timeline.

2. Inspect existing patterns in the workspace
- Reuse existing layout and navigation patterns when they already solve the same problem.
- Reuse shared components before introducing new ones.
- Keep consistency with established project UI patterns.

3. Define structure and interaction model
- Draft section hierarchy (context, main content, supporting actions, help states).
- Map key states: loading, empty, error, and success.
- Define keyboard, mouse, and touch interaction flow.

4. Apply visual system with brand tokens
- Use `#30C2EC` for primary actions and strong visual anchors.
- Use `#00B1F5` for emphasis and interactive highlights.
- For text-font rules [11-12], only use `#30C2EC`, `#00B1F5`, white `#FFFFFF`, and light orange `#FFC069`.
- Do not introduce additional text-font tones unless explicitly requested.
- Reference shared variables from `src/assets/styles/app.css` instead of repeating inline hex values.
- Use neutral surfaces/text for readability and contrast.
- Use gradients, depth, or pattern backgrounds only when they support clarity.

5. Implement in React components
- Keep components small, composable, and responsibility-focused.
- Separate presentation from heavy state/data logic as complexity grows.
- Use semantic landmarks/headings and predictable spacing scales.
- Favor reusable utility classes and shared UI primitives.

6. Validate accessibility and responsiveness
- Verify contrast for text and interactive controls.
- Ensure full keyboard navigation with visible focus states.
- Add screen-reader labels for icon-only controls and form fields.
- Test representative breakpoints: 360px, 768px, 1024px, and 1440px.

7. Polish and final QA
- Keep animation purposeful and non-blocking.
- Make loading and error states informative and calm.
- Remove dead styles/classes and keep code maintainable.
- Summarize tradeoffs and practical follow-up opportunities.

## Decision Branches

- If the request is review-only:
  - Prioritize findings by severity and impact.
  - Avoid broad rewrites unless requested.
- If the feature is net-new:
  - Propose information architecture before implementation.
- If the page already has a stable design language:
  - Preserve that language before introducing bold visual shifts.
- If brand colors reduce contrast:
  - Keep hue intent, but adjust tone/surface pairing until accessible.
- If timeline is tight:
  - Ship critical user flow first, then polish in a second pass.

## Completion Checklist

- User can complete the primary task with minimal friction.
- UI text/font colors align with `#30C2EC`, `#00B1F5`, white `#FFFFFF`, and light orange `#FFC069`.
- Approved colors are sourced from `src/assets/styles/app.css` shared variables.
- `src/assets/styles/app.css` contains only shared/global CSS; feature-specific CSS is separated into feature-local files.
- Loading, empty, error, and success states are implemented.
- Mobile and desktop behavior are validated.
- Keyboard/focus and basic accessibility checks pass.
- Code is componentized, readable, and consistent with project patterns.

## Prompt Starters

- "Apply frontend-uiux-brand-workflow: build a course discovery page with responsive cards and a sticky filter panel."
- "Apply frontend-uiux-brand-workflow: review this dashboard screen for UX and accessibility gaps."
- "Apply frontend-uiux-brand-workflow: refactor this multi-step form to reduce drop-off on mobile."
