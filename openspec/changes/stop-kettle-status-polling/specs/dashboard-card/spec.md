## ADDED Requirements

### Requirement: Subscription-driven UI state

As a dashboard user, I want the kettle card and dialog to react to Home Assistant entity updates, so that opening the UI does not generate background service traffic; the UI SHALL rerender from the Home Assistant state supplied to the component and SHALL NOT start a source-refresh timer or call `homeassistant.update_entity`.

#### Scenario: Home Assistant supplies an updated kettle state

- **Given** a kettle card or dialog is open
- **When** Home Assistant supplies an updated friendly kettle state
- **Then** the visible status rerenders from that state
- **And** the UI makes no source-refresh service call

#### Scenario: The open UI remains idle

- **Given** the card and dialog remain open while the kettle state is unchanged
- **When** at least ten minutes pass
- **Then** no periodic kettle refresh service events are recorded
