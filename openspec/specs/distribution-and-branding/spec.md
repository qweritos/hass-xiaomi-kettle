# Distribution, Branding, and Documentation

## Purpose

Define the public project structure, HACS packaging, frontend lifecycle, kettle-derived branding, screenshots, and single-commit release discipline.

## Requirements

### Requirement: Reusable public project

As a Home Assistant community user, I want a maintainable public project, so that I can install, understand, and reuse the kettle experience; the repository SHALL keep readable TypeScript frontend sources, structured Python integration sources, automated checks, public documentation, and third-party libraries where they safely replace custom utility code.

#### Scenario: A contributor inspects the repository

- **Given** the public repository is cloned
- **When** its source layout is reviewed
- **Then** frontend source, integration source, tests, documentation, and build configuration are clearly separated
- **And** generated frontend output is reproducible from the TypeScript source

### Requirement: Integration-first project identity

As a Home Assistant user, I want the public project name to represent the complete integration; the project SHALL be named Xiaomi Kettle for Home Assistant and published at `qweritos/hass-xiaomi-kettle`.

#### Scenario: Public project metadata is displayed

- **Given** a user views the repository, HACS installation link, integration manifest, package metadata, or documentation
- **When** the project identity is shown
- **Then** it uses Xiaomi Kettle for Home Assistant and the `qweritos/hass-xiaomi-kettle` repository
- **And** the existing `custom:xiaomi-kettle-card` element and frontend bundle names remain stable for dashboard compatibility

#### Scenario: Project checks run

- **Given** documented development dependencies are installed
- **When** `npm run check` runs
- **Then** formatting, linting, TypeScript checks, frontend tests, Python checks, and the production build complete successfully

### Requirement: HACS integration distribution

As a Home Assistant user, I want to install the complete product through HACS, so that backend entities, the card, dialog, and branding arrive together; the repository SHALL validate as a HACS Integration repository and publish `xiaomi_kettle.zip` containing the complete custom component.

The integration SHALL support Home Assistant 2024.7.0 and newer, using compatible entity setup and device-parent metadata APIs across that range.

#### Scenario: A tagged release is published

- **Given** a version tag is pushed
- **When** the release workflow completes
- **Then** GitHub Releases contains an updated `xiaomi_kettle.zip` asset suitable for HACS installation

#### Scenario: Installation completes

- **Given** the user installs the repository through HACS and performs the one required integration restart
- **When** Xiaomi Kettle is added from Devices and services
- **Then** no separate dashboard JavaScript resource needs to be configured

#### Scenario: Installation targets an older supported release

- **Given** the user runs Home Assistant 2024.7.0 or newer
- **When** HACS evaluates and loads the integration
- **Then** installation is permitted
- **And** the helper device remains linked to its Xiaomi Miot source using the device metadata API available in that Home Assistant release

### Requirement: Automatic cache-safe frontend loading

As a Home Assistant administrator, I want frontend updates to load without restarting all of Home Assistant, so that JavaScript iteration and integration upgrades are less disruptive; the integration SHALL register its bundled frontend automatically with a file-versioned URL and replace stale registered URLs when the integration is reloaded.

#### Scenario: The frontend bundle changes

- **Given** a new bundle has a different file modification version
- **When** frontend registration runs during integration setup or reload
- **Then** the old extra JavaScript URL is removed and the new cache-busted URL is registered
- **And** a full Home Assistant restart is not required solely to update that JavaScript file

### Requirement: Kettle-derived brand identity

As a Home Assistant user, I want recognizable kettle branding, so that the helper and its notifications are easy to identify; the project SHALL use the selected second icon concept derived from a real kettle image as its integration and notification icon assets.

#### Scenario: Branding is displayed

- **Given** Home Assistant shows the integration, helper device, or a kettle notification
- **When** the relevant brand asset is requested
- **Then** the bundled kettle icon is used at an appropriate resolution

### Requirement: Authentic isolated screenshots

As a prospective user, I want polished screenshots of the real component, so that documentation accurately represents the product; project screenshots SHALL use live state from a real `yunmi.kettle.v19` device and present the card and dialog independently from the underlying Home Assistant page.

#### Scenario: Dashboard card screenshot is prepared

- **Given** the real card is rendered with live kettle data
- **When** its documentation image is composed
- **Then** the card has comfortable edge offsets, a natural shadow, and a tasteful gradient backdrop

#### Scenario: Dialog screenshot is prepared

- **Given** the real native kettle dialog is open with live data
- **When** its documentation image is composed
- **Then** it is isolated in the same presentation style as the card, without the actual dashboard page visible behind it
- **And** native Home Assistant dialog chrome remains visible

### Requirement: Single-commit release history

As the project maintainer, I want the repository to remain a single amended initial commit, so that published history follows the chosen release workflow; every project update SHALL amend the initial commit rather than create another commit and SHALL move the existing release tag to that amended commit.

#### Scenario: Project files change

- **Given** an update is ready and validated
- **When** it is committed and published
- **Then** the existing initial commit is amended
- **And** the repository still contains exactly one commit
- **And** the existing version tag and release asset are updated for that commit
