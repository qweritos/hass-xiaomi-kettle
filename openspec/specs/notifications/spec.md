# Kettle Notifications

## Purpose

Define configurable, edge-triggered kettle-cycle notifications that appear only in Home Assistant's native sidebar notification center.

## Requirements

### Requirement: Selectable kettle events

As a Home Assistant user, I want to choose which meaningful kettle events notify me, so that the sidebar is useful without becoming noisy; setup and integration options SHALL offer Heating started, Boiling, Finished, Lifted, and Fault event selections, with Finished selected by default.

#### Scenario: Integration is first configured

- **Given** the user selected a compatible kettle
- **When** the notification step opens
- **Then** the supported kettle event types are offered as a multi-select list
- **And** Finished is selected by default

#### Scenario: Notification options are changed

- **Given** the integration is configured
- **When** the user changes event selections through Configure
- **Then** subsequent transitions use the new selection

### Requirement: Sidebar-only delivery

As a Home Assistant user, I want notifications kept inside Home Assistant, so that setup does not require phones or external notify services; the integration SHALL create native persistent notifications and SHALL NOT expose notification-target selectors.

#### Scenario: A selected event occurs

- **Given** a kettle event is enabled
- **When** that state transition occurs
- **Then** a notification appears under Home Assistant's sidebar Notifications item with a kettle-specific title and message
- **And** no `notify.*` service target is requested or called

### Requirement: Edge-triggered notification behavior

As a Home Assistant user, I want one notification per meaningful transition, so that one-second polling does not create duplicates; the integration SHALL emit notifications only when kettle state crosses into an enabled event condition.

#### Scenario: Heating begins

- **Given** the kettle was not heating
- **When** its status changes to Heating
- **Then** Heating started is emitted once
- **And** subsequent refreshes that remain Heating do not emit it again

#### Scenario: A heating cycle ends

- **Given** the prior status was Heating or Boiling
- **When** status changes to Ready, Cooling, or Keeping warm
- **Then** Finished is emitted once

#### Scenario: Lift or fault begins

- **Given** lifted was false or fault was zero
- **When** lifted becomes true or a nonzero fault appears
- **Then** the matching event is emitted once for that edge

### Requirement: Kettle-branded notification icon

As a Home Assistant user, I want kettle notifications visually recognizable, so that I can identify them quickly in the sidebar; notifications created by this integration SHALL display the bundled `icon.png`, while unrelated persistent notifications remain untouched.

#### Scenario: Kettle notification renders

- **Given** a persistent notification ID belongs to Xiaomi Kettle
- **When** Home Assistant renders its notification item
- **Then** the bundled kettle icon appears in the item header

#### Scenario: Unrelated notification renders

- **Given** a persistent notification was created by another integration
- **When** it appears beside kettle notifications
- **Then** Xiaomi Kettle does not alter its icon or layout
