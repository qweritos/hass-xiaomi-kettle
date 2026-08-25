## 1. Implement Subscription-Only Updates

- [x] 1.1 Remove the coordinator's periodic source-refresh timer, polling state, and refresh service call while preserving source-state subscriptions.
- [x] 1.2 Remove the card/dialog refresh timer and post-command refresh call so Lit rerenders only from Home Assistant state updates.
- [x] 1.3 Update integration metadata and customer-facing documentation with concise, product-focused language.

## 2. Add Regression Coverage

- [x] 2.1 Add backend coverage proving source changes update coordinator data without a periodic refresh scheduler or `homeassistant.update_entity` call.
- [x] 2.2 Add frontend coverage proving opening and using the card/dialog creates no refresh timer or refresh service call.
- [x] 2.3 Run formatting, linting, type checking, Python and TypeScript tests, OpenSpec validation, and the production frontend build.

## 3. Verify on Live Home Assistant

- [x] 3.1 Deploy the rebuilt integration to live HAOS and restart or reload it safely.
- [x] 3.2 Verify through the authenticated Chrome session that the card/dialog loads and follows Home Assistant entity updates.
- [x] 3.3 Observe Recorder for at least ten minutes and confirm zero kettle `homeassistant.update_entity` service events while source-driven updates remain functional.

## 4. Release

- [x] 4.1 Update the bugfix version and changelog, ensuring README copy contains no internal implementation or database notes.
- [x] 4.2 Commit and tag the verified release, push it, and publish the GitHub release artifact.
- [x] 4.3 Confirm the published release version and downloadable artifact are available.
