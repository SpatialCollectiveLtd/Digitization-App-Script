CONTRIBUTING GUIDE — Spatial Collective

Thank you for contributing to the DPW automation project. This guide describes the expected workflow for internal contributions.

1. Workflow

- Fork (if required) or create a feature branch off `main`:
  - Branch name format: `feature/<short-desc>` or `fix/<short-desc>`.
- Implement changes in a branch.
- Add tests or run the `DEVELOPMENT.md` test harness where applicable.
- Create a Pull Request (PR) with a clear description and link to any related task.

2. Pull Request Requirements

- PRs must include:
  - A descriptive title and summary of changes.
  - Any migration or deployment steps.
  - Links to test evidence (screenshots, logs) for UI or scripts.
- At least one maintainer review is required before merge.
- Use small, focused PRs for easier review.

3. Code Style

- Keep the Apps Script code readable and well-commented.
- Use constants in `Configuration.gs` for shared values.

4. Tests & Validation

- Run the test harness in `docs/DEVELOPMENT.md` for code that touches the automation logic.
- Manually test changes in a copy of the spreadsheet before merging to `main`.

5. Security

- Do not commit credentials or data files. If a change requires secret or environment configuration, document it in the PR and use secure storage.

6. Release & Tagging

- Maintainers will create release tags (e.g., `v1.0.0`) on `main` when ready.

If you'd like, I can add GitHub Action templates for CI and PR checks.
