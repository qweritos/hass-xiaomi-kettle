# Friendly Home Assistant Device

## Purpose

Define the human-friendly helper device and entities that turn the technical Xiaomi Miot model into a coherent native Home Assistant kettle experience.

## Requirements

### Requirement: Linked helper device

As a Home Assistant user, I want a dedicated kettle device page, so that everyday controls are separate from raw MIoT details; the integration SHALL create one human-friendly helper device for each configured source and link it to the original Xiaomi Miot device.

#### Scenario: A kettle is configured

- **Given** the user selects a supported source device
- **When** setup completes
- **Then** Home Assistant creates a Xiaomi Smart Kettle 2 Pro helper device in the source area
- **And** the helper device identifies the original Xiaomi Miot device as its connection parent

#### Scenario: The same source is configured twice

- **Given** a helper already exists for a Xiaomi Miot device
- **When** the user attempts to select that source again
- **Then** Home Assistant prevents a duplicate config entry and helper device

### Requirement: Friendly entity surface

As a Home Assistant user, I want kettle-focused entities with readable names, so that the device page is useful without understanding MIoT service and property identifiers; the helper device SHALL expose normal Home Assistant entities for the kettle water heater, status, program, Boil, Stop, keep-warm controls, available preferences, and cycle events.

#### Scenario: All source capabilities are available

- **Given** Xiaomi Miot exposes all known `yunmi.kettle.v19` properties and related entities
- **When** the helper device is created
- **Then** it exposes the water heater, status sensor, Program select, Start, Boil and Stop buttons, Keep warm switch, keep-warm temperature and duration numbers, reminder switches, lift-memory switch, custom-knob switch, do-not-disturb switch, and kettle-cycle event

#### Scenario: An optional source capability is absent

- **Given** Xiaomi Miot does not expose one optional related entity
- **When** the helper device is created
- **Then** the unavailable capability is omitted or disabled without breaking the remaining entities

### Requirement: Source traceability

As a Home Assistant administrator, I want every helper entity traceable to its raw source, so that diagnostics and advanced MIoT access remain possible; helper entities SHALL identify the selected Xiaomi Miot source entity and preserve source device metadata where available.

#### Scenario: A helper entity is inspected

- **Given** a friendly kettle entity exists
- **When** code or UI resolves its source metadata
- **Then** it can identify the original Xiaomi Miot water-heater entity and source device

### Requirement: Native device-page usability

As a Home Assistant user, I want the kettle device page to prioritize normal controls, so that I do not need the technical Xiaomi Miot device page for routine use; the helper device SHALL organize supported features into native Controls, Sensors, Events, and Configuration sections with human-readable labels.

#### Scenario: The user opens the helper device page

- **Given** a kettle helper is configured
- **When** its Home Assistant device page opens
- **Then** primary kettle actions and state are visible using friendly entity names
- **And** raw MIoT property identifiers are not required for routine operation
