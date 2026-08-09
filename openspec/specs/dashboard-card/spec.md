# Dashboard Card

## Purpose

Define the compact, mobile-friendly Xiaomi Kettle dashboard card, its optional controls, visual configuration, live state, and navigation behavior.

## Requirements

### Requirement: Self-contained custom card

As a dashboard user, I want a purpose-built kettle card, so that installation does not depend on unrelated popup extensions; Xiaomi Kettle SHALL provide its own Lovelace card and SHALL NOT require browser-mod, popup-card, or another popup-card implementation.

#### Scenario: Card dependencies are evaluated

- **Given** Xiaomi Kettle is installed through HACS or manually
- **When** the dashboard card is loaded
- **Then** it renders and opens its native more-info dialog without browser-mod or popup-card being installed

### Requirement: Compact card composition

As a dashboard user, I want a compact kettle card with the important information first, so that it remains useful on a phone and in dense dashboards; the card SHALL contain a header, an always-visible status block, an optional Programs block, and an optional Boil/Stop controls row.

#### Scenario: Default card renders

- **Given** a supported kettle entity is configured
- **When** the card renders with default options
- **Then** it shows the configured or friendly title and kettle icon
- **And** it shows current temperature, status, target temperature, keep-warm summary, programs, and Boil and Stop controls
- **And** preset buttons are presented without a redundant `Programs` caption

#### Scenario: Keep-warm status summary is conditional and live

- **Given** Keep warm is enabled
- **When** the status block renders
- **Then** it shows `Keep <temperature> · <remaining duration> left` after the target temperature
- **And** remaining duration is the configured duration minus Xiaomi Miot's elapsed `function.warming_time`
- **Given** Keep warm is disabled
- **When** the status block renders
- **Then** no Keep clause is shown

#### Scenario: An active program is displayed

- **Given** the kettle is Heating, Boiling, or Keeping warm
- **And** its target mode identifies Manual, Boil, or a discovered Xiaomi program
- **When** the status block renders
- **Then** the status label shows that program name instead of a generic operating-state label
- **Given** the kettle is not running
- **When** the status block renders
- **Then** a remembered target mode does not replace the Ready, Cooling, fault, lifted, or unavailable status

#### Scenario: The kettle is keeping warm

- **Given** the kettle status is Keeping warm
- **When** the live summary renders
- **Then** it omits the heating target and shows only the keep-warm temperature and remaining time

#### Scenario: Optional sections are disabled

- **Given** Programs or controls are disabled in card configuration
- **When** the card renders
- **Then** the corresponding entire block is omitted
- **And** the status block remains visible

### Requirement: Focused card header

As a dashboard user, I want a clean header, so that it does not repeat technical details or waste space; the card header SHALL omit a model subtitle and a right-side open icon while retaining the title and configurable kettle icon.

#### Scenario: Header is displayed

- **Given** the card is configured for a kettle
- **When** it renders
- **Then** no `yunmi.kettle.v19` model line or right-side open affordance is shown

### Requirement: Compact live status block

As a kettle user, I want current conditions readable at a glance, so that I can judge the kettle without opening its dialog; the status block SHALL place the large current temperature beside the status and target/keep-warm summary using restrained vertical padding and live Home Assistant state.

#### Scenario: State changes while the card is visible

- **Given** the card is open
- **When** current temperature, operating status, target, or keep-warm values change
- **Then** the displayed status block updates without reopening or refreshing the dashboard

#### Scenario: Dashboard opens while Home Assistant is starting

- **Given** Lovelace opens before the kettle frontend module or entity registries finish loading
- **When** the card type becomes available and subsequent Home Assistant state snapshots arrive
- **Then** any temporary Lovelace error placeholder is rebuilt automatically without a page refresh
- **And** an integration-managed, per-start versioned `/local` module resource is available before Xiaomi Miot setup and prevents stale dashboard resource URLs
- **And** the configured card uses Home Assistant's native startup warning component and wording
- **And** it does not use the red missing-configuration error for a temporarily absent entity
- **And** the complete live card replaces that loading state without user action

#### Scenario: Status block is laid out

- **Given** the card has a valid kettle state
- **When** the status block renders
- **Then** the status and `Target … · Keep …` summary appear to the right of the large temperature where space permits
- **And** the block avoids excessive top and bottom padding

### Requirement: Native history from temperature

As a kettle user, I want the temperature value to open its time graph, so that I can inspect heating and cooling over time; tapping the large temperature SHALL open Home Assistant's native History view for the applicable water-heater entity.

#### Scenario: Temperature is tapped

- **Given** the card displays a friendly or source water-heater entity
- **When** the user taps the large current temperature
- **Then** the native more-info modal opens directly to History
- **And** the graph contains current and target temperature series when recorder data is available

#### Scenario: Temperature is keyboard-focused

- **Given** the user navigates with a keyboard
- **When** focus reaches the temperature action
- **Then** it has an accessible name and visible focus indication

### Requirement: Card opens the kettle dialog

As a dashboard user, I want the header to open the complete kettle controls, so that the compact card does not need to expose every setting; tapping the card header SHALL open the native Home Assistant more-info modal for the configured kettle entity.

#### Scenario: Header is tapped

- **Given** the card has a valid kettle entity
- **When** the user taps its header
- **Then** the custom kettle content opens inside native Home Assistant dialog chrome

### Requirement: Visual editor and YAML configuration

As a dashboard editor, I want to configure the card visually or in YAML, so that it fits both common and advanced workflows; the card SHALL support entity, title, icon, Programs visibility, and controls visibility in Home Assistant's card editor and equivalent YAML keys.

#### Scenario: Card is configured in the UI

- **Given** the user adds Xiaomi Kettle Card from the card picker
- **When** the visual editor opens
- **Then** it offers kettle entity, Title, Icon, Show programs, and Show Boil and Stop controls fields

#### Scenario: Optional identity values are omitted

- **Given** no custom title or icon is configured
- **When** the card renders
- **Then** it derives a friendly title and kettle icon from entity state

### Requirement: Theme-native responsive presentation

As a Home Assistant user, I want the card to match my dashboard and fit a phone, so that it feels native rather than fragile; the card SHALL use Home Assistant theme variables and controls, fit its container at mobile widths, and never introduce horizontal scrolling.

#### Scenario: Narrow mobile layout

- **Given** the card is rendered at a phone-width viewport
- **When** all enabled sections are visible
- **Then** programs reflow into a compact grid, controls remain tappable, text does not force overflow, and no horizontal scrollbar appears

#### Scenario: Theme changes

- **Given** Home Assistant changes between supported themes
- **When** the card rerenders
- **Then** surfaces, borders, text, primary actions, warnings, and errors follow Home Assistant theme colors
