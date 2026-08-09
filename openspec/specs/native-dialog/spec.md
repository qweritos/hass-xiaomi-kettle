# Native Kettle Dialog

## Purpose

Define replacement of the technical Xiaomi Miot more-info body with a compact kettle experience while preserving Home Assistant's own modal chrome and navigation.

## Requirements

### Requirement: Model-wide more-info interception

As a Home Assistant user, I want every entity for this kettle model to open the same useful kettle dialog, so that the experience is consistent from cards, device pages, and entity lists; the frontend SHALL recognize all source and helper entities associated with `yunmi.kettle.v19` and route their normal more-info opening to kettle content.

#### Scenario: A source entity is opened

- **Given** an entity belongs to a Xiaomi Miot device whose model is `yunmi.kettle.v19`
- **When** Home Assistant opens more info for that entity
- **Then** the modal displays the kettle control body

#### Scenario: A helper entity is opened

- **Given** a Xiaomi Kettle helper entity points to a supported source
- **When** Home Assistant opens more info for that helper entity
- **Then** the modal displays the same kettle control body resolved from the source

#### Scenario: An unrelated entity is opened

- **Given** an entity does not resolve to the supported kettle model
- **When** Home Assistant opens more info
- **Then** its native entity-specific content remains unchanged

### Requirement: True content replacement

As a Home Assistant user, I want one coherent dialog body, so that technical controls are not duplicated above the friendly UI; the frontend SHALL hide and replace the original info-view contents rather than append kettle controls below them.

#### Scenario: Kettle info view is active

- **Given** the more-info modal is showing a supported kettle entity
- **When** the custom body is installed
- **Then** original info-view children are hidden and made non-interactive
- **And** exactly one kettle content component occupies the body

#### Scenario: The modal leaves the info view

- **Given** custom kettle content replaced the info body
- **When** the user navigates to History or another native view
- **Then** native children are restored and custom content is removed for that view

### Requirement: Native Home Assistant modal chrome

As a Home Assistant user, I want standard modal navigation and device actions, so that the kettle behaves like a first-class entity; the replacement SHALL preserve Home Assistant's close/back control, area and device title, History, Settings, menu, and device-information navigation.

#### Scenario: Kettle dialog opens

- **Given** the user opens a supported kettle entity
- **When** the modal appears
- **Then** Home Assistant's native header and controls surround the custom body
- **And** no browser-mod, popup-card, or other popup dependency is used

### Requirement: Complete kettle body

As a kettle user, I want all routine actions in one dialog, so that I rarely need the technical device page; the dialog SHALL show a compact status block, dynamic Programs, target temperature, keep-warm toggle, keep-warm temperature and duration, Start, Boil, Stop, and available preferences.

#### Scenario: Full-capability kettle opens

- **Given** all related source entities are available
- **When** the kettle info view renders
- **Then** every supported status, program, action, setting, and preference is reachable in the dialog body

#### Scenario: Active program and remaining keep-warm time are shown

- **Given** the kettle is Heating, Boiling, or Keeping warm
- **When** the status block renders
- **Then** its status label shows the active Manual, Boil, or discovered Xiaomi program name
- **And** its keep-warm summary shows the configured duration minus elapsed keep-warm time as time left
- **And** a Keeping warm status omits the no-longer-relevant heating target

#### Scenario: Section labeling is rendered

- **Given** the dialog is open
- **When** its body is inspected
- **Then** it does not add extraneous `Programs`, `Manual`, or `Keep warm` group captions above controls that are already self-labeled

### Requirement: Stable real-time interaction

As a kettle user, I want commands and state updates to preserve my place, so that the dialog remains comfortable during heating; the dialog SHALL update from live Home Assistant state without closing, reopening, blinking, or shifting action controls during confirmation.

#### Scenario: A command is submitted

- **Given** the dialog is open
- **When** Start, Boil, Stop, a program, or a setting sends a service call
- **Then** the same modal and scroll position remain active while state refreshes

#### Scenario: A two-tap action is armed

- **Given** action controls are visible
- **When** the first tap changes one button to `Tap again`
- **Then** no explanatory message row is inserted and the button remains at the same screen position for the second tap

### Requirement: Compact responsive styling

As a mobile user, I want the dialog to use familiar Home Assistant styling and available screen space efficiently, so that all controls remain convenient; the dialog body SHALL use theme-native colors, compact spacing, mobile reflow, and constrained widths without horizontal scrolling.

#### Scenario: Dialog opens on a phone

- **Given** a narrow viewport
- **When** the kettle modal renders
- **Then** the status block remains compact, Programs reflow, action buttons remain tappable, and the body scrolls only vertically

### Requirement: Native temperature history navigation

As a kettle user, I want to inspect the temperature graph from the dialog's main reading, so that heating behavior is one tap away; tapping the large current temperature in the dialog SHALL switch the same native modal to its History view for a water-heater entity.

#### Scenario: Dialog temperature is tapped

- **Given** the custom info body is active
- **When** the user taps its large temperature
- **Then** the native History view replaces the custom body
- **And** Home Assistant provides a Back to info control
