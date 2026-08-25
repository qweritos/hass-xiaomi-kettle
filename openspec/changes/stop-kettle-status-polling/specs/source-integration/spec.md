## MODIFIED Requirements

### Requirement: Fixed near-real-time refresh

As a kettle user, I want temperature and status to update promptly without redundant refresh traffic, so that the UI reflects state published by Xiaomi Miot; the integration SHALL subscribe to source-state changes and SHALL NOT poll or call `homeassistant.update_entity`.

#### Scenario: Xiaomi Miot publishes a change

- **Given** the configured source entity or one of its related control entities changes
- **When** Home Assistant receives the new state
- **Then** friendly entities and open kettle UI update from that state
- **And** kettle-cycle transitions remain edge-triggered

#### Scenario: No state event arrives

- **Given** the kettle is configured and available
- **When** Xiaomi Miot publishes no source-state change
- **Then** the integration makes no refresh service call
- **And** it retains the last published source state

#### Scenario: The user opens integration options

- **Given** the kettle is configured
- **When** the user edits its options
- **Then** no refresh-interval field is offered
