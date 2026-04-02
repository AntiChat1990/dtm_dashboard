# API Skill

When working with API:

Structure:
- All requests go through /services
- Use async/await
- Separate fetch logic from UI

Rules:
- Handle loading and error states
- Use try/catch
- Return typed responses (TypeScript)

Do NOT:
- Call API directly inside components if avoidable
- Mix business logic with UI

Error handling:
- Show user-friendly messages