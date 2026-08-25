# Changelog

## 0.1.2

- Replaced backend and frontend status polling with source-state subscriptions.
- Eliminated recurring `homeassistant.update_entity` service events from Recorder.

## 0.1.1

- Added Russian translations for setup, preferences, entities, states, and errors.
- Localized the bundled dashboard card, visual editor, and native dialog from the Home Assistant language setting.
- Added a Russian README with matching Russian card and dialog screenshots.

## 0.1.0

- Initial public release as a HACS custom integration.
- Friendly helper device and entities linked to the original Xiaomi Miot kettle.
- Config flow for kettle selection and sidebar notification events.
- Edge-triggered kettle-cycle event entity and native Home Assistant notifications.
- Packaged kettle icon shown beside native sidebar notification titles.
- Fixed one-second live state refresh without a user-facing interval setting.
- Visual dashboard-card editor for entity, title, icon, programs, and controls.
- Bundled frontend loaded automatically without a Lovelace resource.
- Native more-info body replacement for `yunmi.kettle.v19` devices.
- Dynamic Xiaomi Home presets from `function.extended_mode`.
- Compact dashboard status with optional programs and Boil/Stop controls.
- Full target-temperature, keep-warm, Start, Boil, and Stop controls in the dialog.
- Optional dashboard presets loaded from `function.extended_mode`.
- Double-press protection for heating actions.
