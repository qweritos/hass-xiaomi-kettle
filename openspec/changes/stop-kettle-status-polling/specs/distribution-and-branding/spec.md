## ADDED Requirements

### Requirement: Customer-focused behavior documentation

As a prospective user, I want the README to describe product behavior in plain language, so that I can understand the integration without knowing its implementation; README feature copy SHALL remain customer-focused.

#### Scenario: Subscription-driven updates are documented

- **Given** the README describes automatic kettle status updates
- **When** a customer reads the feature description
- **Then** it states that status follows changes published by Xiaomi Miot
- **And** it does not mention internal timers, service names, database contamination, or implementation mechanics
