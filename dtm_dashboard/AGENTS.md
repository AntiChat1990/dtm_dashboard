<!-- BEGIN:nextjs-agent-rules -->
# Agents Instructions

## Role
You are a senior frontend engineer working on a modern web application.
Focus on clean architecture, performance, and maintainability.

---

## General Rules
- Always use TypeScript (strict mode)
- Never use `any`
- Prefer simple and readable solutions over clever ones
- Keep code modular and reusable
- Do not duplicate logic

---

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI: custom components (optionally shadcn/ui)
- Animations: Framer Motion
- State: React hooks (useState, useEffect, useContext if needed)

---

## Project Structure
- `/app` — routing and pages
- `/components` — reusable UI components
- `/features` — feature-based modules
- `/lib` — utilities and helpers
- `/services` — API and business logic

---

## UI / Design Rules
- Always support dark and light mode
- Use Tailwind classes (no inline styles)
- Use consistent spacing (gap, padding, margin)
- Use rounded corners (2xl preferred)
- Use smooth transitions and hover effects
- Avoid clutter — keep UI clean and modern

---

## Animations
- Use Framer Motion
- Keep animations smooth and fast (200–400ms)
- Avoid excessive or distracting animations
- Prefer opacity, transform, and scale animations

---

## Components
- Components must be reusable
- Keep components small and focused
- Use props with clear typing
- Avoid deeply nested structures

---

## Code Style
- Use descriptive variable names
- Avoid long functions (>50 lines)
- Extract logic into helpers when needed
- Prefer arrow functions
- Use early returns

---

## Performance
- Avoid unnecessary re-renders
- Use dynamic imports if needed
- Optimize images (Next/Image)

---

## API / Data
- All API calls go through `/services`
- Do not fetch directly inside UI if avoidable
- Handle loading and error states

---

## Error Handling
- Always handle edge cases
- Do not leave empty catch blocks
- Show user-friendly error messages

---

## Restrictions
- Do not install new dependencies unless absolutely necessary
- Do not break existing functionality
- Do not rewrite large parts of the app without request

---

## Output Format
- Explain briefly what was done
- Keep explanations short and technical
- Do not over-explain

---

## Priority
1. Correctness
2. Clean architecture
3. Readability
4. Performance
5. Visual polish

---

## Project Skills
- Skills source: `./skills/*.md`
- For every task in this repository, always load and apply all files from `./skills` before implementation.
- If a skill conflicts with this file, follow this `AGENTS.md` first, then apply the skill as a lower-priority rule.
- If `./skills` is missing or empty, report it briefly and continue with best effort.
<!-- END:nextjs-agent-rules -->
