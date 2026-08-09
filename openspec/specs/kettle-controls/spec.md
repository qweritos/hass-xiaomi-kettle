# Kettle Controls and Programs

## Purpose

Define reliable kettle actions, keep-warm settings, dynamic Xiaomi Home programs, and the inline two-tap safety interaction used by the card and dialog.

## Requirements

### Requirement: Manual heating controls

As a kettle user, I want to start, boil, and stop from Home Assistant, so that I can operate the kettle without opening Xiaomi Home; the product SHALL support Start with the chosen target and keep-warm settings, Boil using the kettle's native boil command, and immediate Stop when the source exposes it.

#### Scenario: Manual Start is confirmed

- **Given** target temperature, keep-warm mode, keep-warm temperature, and duration are selected
- **When** the user completes the two-tap Start interaction
- **Then** the integration sends those values and starts manual heating through Xiaomi Miot

#### Scenario: Boil is confirmed

- **Given** current keep-warm settings are available
- **When** the user completes the two-tap Boil interaction
- **Then** the integration starts the native boil program with a 99°C target and the current keep-warm settings

#### Scenario: Status kettle arms Boil

- **Given** the kettle icon is visible in the status block
- **When** the user taps it once
- **Then** the fixed-size icon changes in place to a still yellow steam kettle
- **And** the steam glyph is offset by its three-unit body-coordinate difference so the kettle body matches the idle icon at desktop and mobile sizes
- **And** the existing Ready or Cooling status label changes in place to orange `Tap again to boil`
- **And** no separate caption is inserted below the icon or elsewhere in the layout
- **When** the same Boil action is tapped again within one second
- **Then** the integration starts the native boil program

#### Scenario: Stop is pressed

- **Given** the source exposes a Stop button
- **When** the user presses Stop
- **Then** the integration immediately invokes that source button without requiring a second tap

#### Scenario: Active status kettle is tapped

- **Given** the kettle reports Heating, Boiling, or Keeping warm
- **And** the status-block kettle icon is visible
- **When** the user taps that icon once
- **Then** the integration immediately invokes Stop without arming Boil or requiring confirmation

### Requirement: Temperature and keep-warm settings

As a kettle user, I want straightforward temperature and keep-warm controls, so that heating behavior matches my drink; the dialog SHALL allow target temperature, keep-warm enablement, keep-warm temperature, and keep-warm duration to be changed through normal Home Assistant service calls.

#### Scenario: Keep-warm dependent settings are unavailable while disabled

- **Given** Keep warm is off
- **When** the card or replacement dialog renders its kettle settings
- **Then** keep-warm temperature and duration remain visible but disabled
- **And** enabling Keep warm immediately enables both controls

#### Scenario: Target temperature changes

- **Given** the kettle dialog is open
- **When** the user chooses a target from 40°C through 99°C
- **Then** the selected value is displayed immediately and committed to the source water heater

#### Scenario: Keep-warm settings change

- **Given** the corresponding source entities are available
- **When** the user toggles Keep warm or changes its temperature or duration
- **Then** the integration writes the value through the matching switch or number entity
- **And** it does not add a transient `Setting updated` message to the dialog

### Requirement: Optimistic helper state

As a kettle user, I want the friendly helper device to reflect my action immediately, so that the interface feels responsive while Xiaomi Miot completes the request; every action with a predictable result SHALL optimistically publish its expected affected helper state before awaiting the Xiaomi Miot response.

#### Scenario: A heating action is dispatched

- **Given** the helper device is Ready, Cooling, or Keeping warm
- **When** a confirmed Start, Boil, or program action begins dispatch
- **Then** the helper water heater and status sensor immediately report Heating before Xiaomi Miot returns
- **And** commanded target, keep-warm, duration, and program values are reflected immediately where applicable

#### Scenario: Stop is dispatched

- **Given** the helper device reports Heating, Boiling, or Keeping warm
- **When** Stop begins dispatch
- **Then** the helper water heater and status sensor immediately leave the active state and report Cooling before Xiaomi Miot returns

#### Scenario: A setting action is dispatched

- **Given** a target, keep-warm, duration, reminder, lift-memory, custom-knob, or do-not-disturb value is visible on the helper device
- **When** the user changes that value
- **Then** the affected helper entity immediately exposes the requested value before Xiaomi Miot returns
- **And** unrelated helper state remains unchanged

#### Scenario: Xiaomi Miot confirms with source state

- **Given** one or more helper values are optimistic
- **When** a refreshed Xiaomi Miot source value matches an optimistic value
- **Then** the confirmed field becomes authoritative without a visible state jump

#### Scenario: A stale source snapshot arrives

- **Given** one or more helper values are optimistic
- **When** a related source event arrives before the main Xiaomi Miot state reflects the command
- **Then** stale values do not replace the pending optimistic fields
- **And** the latest source values remain authoritative for all unrelated fields

#### Scenario: Optimistic reconciliation expires

- **Given** an accepted action has not been confirmed by the source
- **When** the fixed 10-second reconciliation window expires
- **Then** the helper returns to the latest authoritative source state
- **And** the normal minimal source refresh discovers the eventual device state

#### Scenario: Xiaomi Miot rejects the action

- **Given** the helper published an optimistic action state
- **When** Xiaomi Miot rejects the command or the service call fails
- **Then** the helper restores the last authoritative source state
- **And** the initiating UI reports the command failure without closing or blinking

#### Scenario: Xiaomi Miot partially accepts a property batch

- **Given** a Start, Boil, or program command contains several related MIoT properties
- **When** Xiaomi accepts at least one property but reports a non-zero result for another
- **Then** the command is treated as accepted for optimistic reconciliation
- **And** the dialog does not display a partial-setting rejection row

#### Scenario: Optimistic state precedes physical confirmation

- **Given** a heat-start or Stop action has updated helper state optimistically
- **When** no confirming source transition has arrived yet
- **Then** the integration does not emit a physical kettle-cycle event or sidebar notification solely from the optimistic update

### Requirement: Xiaomi Home program discovery

As a kettle user, I want Home Assistant programs to match Xiaomi Home, so that renamed or customized presets stay consistent; the product SHALL build its program list from the source `function.extended_mode` value rather than from a static preset list.

#### Scenario: Extended mode contains programs

- **Given** Xiaomi Miot reports underscore-separated records in `name,target,keep_enabled,keep_temperature,duration_minutes` format
- **When** the source state is normalized
- **Then** each valid record becomes a program in the same order with its name, target, keep-warm flag, keep-warm temperature, and duration
- **And** record positions map to MIoT target modes beginning at 10

#### Scenario: The known example is parsed

- **Given** `function.extended_mode` is `Warm water,45,1,45,1440_Wolfberries,70,1,70,1440_Scented tea,80,1,80,1440_Tea 2,80,1,80,60`
- **When** programs are rendered
- **Then** Warm water, Wolfberries, Scented tea, and Tea 2 appear with their supplied values instead of built-in substitutes

#### Scenario: A malformed record is present

- **Given** one extended-mode record lacks required fields or numeric values
- **When** the program list is parsed
- **Then** that record is ignored without preventing valid programs from loading

### Requirement: Program execution

As a kettle user, I want a discovered program to apply all of its settings, so that Home Assistant behaves like Xiaomi Home; the product SHALL send the program target, keep-warm flag, keep-warm temperature, duration, and mapped target mode through Xiaomi Miot after confirmation.

#### Scenario: A program is confirmed

- **Given** a valid discovered program is displayed
- **When** the user completes its two-tap interaction
- **Then** all parsed program values are sent in one program-start operation

#### Scenario: A program is previewed while awaiting confirmation

- **Given** a valid discovered program is idle
- **When** the user taps it once
- **Then** the status label changes to `Tap again · <program name>`
- **And** the status summary previews that program's target, keep-warm temperature, and duration
- **And** that temporary value line uses a muted yellow-gray warning tint distinct from the live value line
- **When** one second passes without a matching second tap
- **Then** the status label and summary revert together to the live kettle values
- **And** no kettle command is sent

### Requirement: Configurable program icons

As a Home Assistant user, I want to assign an icon to each exact Xiaomi preset name, so that programs are visually recognizable regardless of their language or custom name; the product SHALL support kettle-wide preset icon mappings in integration options and per-card mappings in the visual editor and YAML.

#### Scenario: A kettle-wide icon is configured

- **Given** integration options list the presets currently discovered from Xiaomi Home
- **When** the user chooses an icon from the native icon picker beside an exact preset name
- **Then** the configured icon is displayed when that preset renders in the native dialog or a card without an override

#### Scenario: A card-specific icon is configured

- **Given** the visual card editor lists the presets discovered for its selected kettle
- **When** the user chooses an icon from the native icon picker beside a preset
- **Then** the card-specific icon overrides the kettle-wide icon when that preset renders on the card

#### Scenario: No icon mapping exists

- **Given** a discovered preset name has no configured icon
- **When** it renders
- **Then** the product selects a sensible automatic fallback from the name and target temperature

#### Scenario: A Xiaomi preset is renamed

- **Given** an icon mapping refers to the former exact preset name
- **When** Xiaomi Miot reports a different name
- **Then** the stale mapping is not applied to the renamed preset
- **And** the automatic fallback is used until the new exact name is configured

### Requirement: Inline two-tap confirmation

As a kettle user, I want heat-starting actions protected from accidental taps, so that the kettle cannot start from one stray touch; every Start, Boil, and program button SHALL require a second tap on the same button within one second, without opening a confirmation dialog or inserting a message row.

#### Scenario: First tap arms an action

- **Given** Start, Boil, or a program is idle
- **When** the user taps it once
- **Then** that same button changes in place to `Tap again`
- **And** surrounding controls do not move, the modal does not blink, and no command is sent

#### Scenario: Matching second tap arrives in time

- **Given** an action button is armed
- **When** the same button is tapped again within one second
- **Then** the requested heating action runs once
- **And** the button returns to its normal state

#### Scenario: Confirmation expires

- **Given** an action button is armed
- **When** one second passes without a matching second tap
- **Then** the button automatically returns to its normal label
- **And** no kettle command is sent

#### Scenario: A different action is tapped

- **Given** one action button is armed
- **When** the user taps a different heat-starting action
- **Then** the previous action is disarmed
- **And** the newly selected action begins its own one-second confirmation window
