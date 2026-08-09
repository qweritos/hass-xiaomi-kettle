# Xiaomi Miot Source Integration

## Purpose

Define how Xiaomi Kettle discovers and mirrors a supported Xiaomi Miot kettle while leaving Xiaomi Miot responsible for the physical device connection.

## Requirements

### Requirement: Supported kettle discovery

As a Home Assistant user, I want setup to list only compatible kettles, so that I cannot accidentally configure the helper against an unrelated device; the integration SHALL accept enabled Xiaomi Miot water-heater entities whose device model is `yunmi.kettle.v19`.

#### Scenario: Compatible source is available

- **Given** Xiaomi Miot exposes an enabled water-heater entity for a `yunmi.kettle.v19` device
- **When** the user starts the Xiaomi Kettle config flow
- **Then** that kettle is listed with a human-readable area and device label

#### Scenario: No compatible source exists

- **Given** Home Assistant has no enabled Xiaomi Miot water-heater entity for `yunmi.kettle.v19`
- **When** the user starts the config flow
- **Then** setup stops with a clear no-compatible-device result

### Requirement: Single transport ownership

As a Home Assistant operator, I want Xiaomi Miot to remain the only device transport, so that the kettle is not subjected to competing local connections; Xiaomi Kettle SHALL read state and send raw MIoT commands through the selected Xiaomi Miot entities and services without opening a second MiIO connection.

#### Scenario: A command is sent

- **Given** a supported source entity is configured
- **When** the user changes a kettle setting or starts a program
- **Then** the integration sends the request through Xiaomi Miot using the selected source entity
- **And** it does not create an independent network connection to the kettle

### Requirement: Fixed near-real-time refresh

As a kettle user, I want temperature and status to update promptly, so that the UI reflects the physical kettle while I use it; the integration SHALL subscribe to source-state changes and request a source refresh every second using a fixed, non-configurable interval.

#### Scenario: Xiaomi Miot publishes a change

- **Given** the configured source entity or one of its related control entities changes
- **When** Home Assistant receives the new state
- **Then** friendly entities and open kettle UI update from that state without waiting for the next periodic refresh

#### Scenario: No state event arrives

- **Given** the kettle is configured and available
- **When** one second elapses without an in-progress refresh
- **Then** the integration requests `homeassistant.update_entity` for the Xiaomi Miot water heater

#### Scenario: The user opens integration options

- **Given** the kettle is configured
- **When** the user edits its options
- **Then** no refresh-interval field is offered

### Requirement: Human-readable state normalization

As a Home Assistant user, I want technical MIoT values translated into kettle concepts, so that status and controls are understandable; the integration SHALL normalize current and target temperatures, keep-warm values, warming time, lifted state, faults, availability, and status codes into stable friendly data.

#### Scenario: The kettle reports a normal status code

- **Given** the source reports status code 0, 1, 2, 3, or 4
- **When** the coordinator reads the source
- **Then** it exposes Ready, Heating, Boiling, Cooling, or Keeping warm respectively

#### Scenario: Lift or fault overrides normal status

- **Given** the source reports that the kettle is lifted or has a nonzero fault
- **When** the coordinator normalizes the source state
- **Then** Lifted or Fault takes precedence over the normal status-code label

#### Scenario: The source is unavailable

- **Given** the selected Xiaomi Miot water heater is unavailable
- **When** friendly state is refreshed
- **Then** the friendly kettle reports unavailable without fabricating current values
