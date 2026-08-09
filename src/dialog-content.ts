import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ARM_TIMEOUT, CONTENT_TAG, DEFAULT_POLL_INTERVAL } from './constants';
import { resolveKettleEntities } from './device';
import { dialogStyles } from './dialog-styles';
import {
  formatDuration,
  getStatus,
  parsePresets,
  programNameForMode,
  remainingKeepWarmMinutes,
} from './kettle';
import { startBoil, startManual, startPreset } from './miot';
import type { KettleHass, KettlePreset, ResolvedKettleEntities } from './types';

function numberState(hass: KettleHass, entityId: string | undefined, fallback: number): number {
  const value = Number(entityId ? hass.states[entityId]?.state : undefined);
  return Number.isFinite(value) ? value : fallback;
}

export class XiaomiKettleDialogContent extends LitElement {
  static override properties = {
    hass: { attribute: false },
    entityId: { attribute: false },
    pollInterval: { attribute: false },
    cardMode: { attribute: false },
    showControls: { attribute: false },
    showPresets: { attribute: false },
    showPreferences: { attribute: false },
    presetIcons: { attribute: false },
    _armedKey: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _target: { state: true },
    _keep: { state: true },
    _keepTemperature: { state: true },
    _keepDuration: { state: true },
  };

  static override styles = dialogStyles;

  declare hass: KettleHass;
  declare entityId: string;
  declare pollInterval: number;
  declare cardMode: boolean;
  declare showControls: boolean;
  declare showPresets: boolean;
  declare showPreferences: boolean;
  declare presetIcons?: Record<string, string>;

  private _armedKey?: string;
  private _armedUntil = 0;
  private _busy = false;
  private _error?: string;
  private _target?: number;
  private _keep?: boolean;
  private _keepTemperature?: number;
  private _keepDuration?: number;
  private _armTimer?: number;
  private _pollTimer?: number;

  constructor() {
    super();
    this.entityId = '';
    this.pollInterval = DEFAULT_POLL_INTERVAL;
    this.cardMode = false;
    this.showControls = true;
    this.showPresets = true;
    this.showPreferences = true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._pollTimer = window.setInterval(() => this._refresh(), this.pollInterval * 1_000);
    queueMicrotask(() => this._refresh());
  }

  override disconnectedCallback(): void {
    window.clearTimeout(this._armTimer);
    window.clearInterval(this._pollTimer);
    super.disconnectedCallback();
  }

  private _resolve(): ResolvedKettleEntities | undefined {
    return this.hass && this.entityId ? resolveKettleEntities(this.hass, this.entityId) : undefined;
  }

  private _refresh(): void {
    const entityId = this._resolve()?.sourceMain;
    if (!entityId) return;
    void this.hass
      .callService('homeassistant', 'update_entity', { entity_id: entityId })
      .catch(() => undefined);
  }

  private _press(entityId: string): Promise<void> {
    return this.hass.callService('button', 'press', { entity_id: entityId });
  }

  private _startManual(
    entities: ResolvedKettleEntities,
    target: number,
    keep: boolean,
    keepTemperature: number,
    duration: number,
  ): Promise<void> {
    return entities.start
      ? this._press(entities.start)
      : startManual(this.hass, entities.sourceMain, target, keep, keepTemperature, duration);
  }

  private _startBoil(
    entities: ResolvedKettleEntities,
    keep: boolean,
    keepTemperature: number,
    duration: number,
  ): Promise<void> {
    return entities.boil
      ? this._press(entities.boil)
      : startBoil(this.hass, entities.sourceMain, keep, keepTemperature, duration);
  }

  private _startPreset(entities: ResolvedKettleEntities, preset: KettlePreset): Promise<void> {
    return entities.program
      ? this.hass.callService('select', 'select_option', {
          entity_id: entities.program,
          option: preset.name,
        })
      : startPreset(this.hass, entities.sourceMain, preset);
  }

  private _stop(entities: ResolvedKettleEntities): Promise<void> {
    return entities.stop
      ? this._press(entities.stop)
      : Promise.reject(new Error('Stop is unavailable'));
  }

  private _openTemperatureHistory(entities: ResolvedKettleEntities): void {
    const entityId = this.entityId.startsWith('water_heater.') ? this.entityId : entities.main;
    fireEvent(this, 'hass-more-info', {
      entityId,
      view: 'history',
    } as HASSDomEvents['hass-more-info'] & { view: 'history' });
  }

  private _values(entities: ResolvedKettleEntities): {
    target: number;
    keep: boolean;
    keepTemperature: number;
    duration: number;
  } {
    const attributes = this.hass.states[entities.main]?.attributes ?? {};
    return {
      target: (this._target ?? Number(attributes.temperature)) || 70,
      keep:
        this._keep ??
        (entities.keepWarm ? this.hass.states[entities.keepWarm]?.state === 'on' : false),
      keepTemperature: this._keepTemperature ?? numberState(this.hass, entities.keepTemp, 40),
      duration: this._keepDuration ?? numberState(this.hass, entities.keepTime, 1_440),
    };
  }

  private _arm(key: string, action: () => Promise<void>): void {
    if (this._busy) return;
    const now = Date.now();
    if (this._armedKey === key && this._armedUntil > now) {
      window.clearTimeout(this._armTimer);
      this._armedKey = undefined;
      this._armedUntil = 0;
      void this._run(action);
      return;
    }

    window.clearTimeout(this._armTimer);
    this._armedKey = key;
    this._armedUntil = now + ARM_TIMEOUT;
    this._error = undefined;
    this._armTimer = window.setTimeout(() => {
      if (this._armedKey !== key) return;
      this._armedKey = undefined;
      this._armedUntil = 0;
    }, ARM_TIMEOUT);
  }

  private async _run(action: () => Promise<unknown>): Promise<void> {
    this._busy = true;
    this._error = undefined;
    try {
      await action();
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Kettle command failed';
    } finally {
      this._busy = false;
      this._armedKey = undefined;
      this._refresh();
    }
  }

  private _switch(entityId: string | undefined, checked: boolean): void {
    if (!entityId) return;
    void this._run(() =>
      this.hass.callService('switch', checked ? 'turn_on' : 'turn_off', {
        entity_id: entityId,
      }),
    );
  }

  private _setNumber(entityId: string | undefined, value: number): void {
    if (!entityId) return;
    void this._run(() =>
      this.hass.callService('number', 'set_value', { entity_id: entityId, value }),
    );
  }

  private _toggleRow(
    entityId: string | undefined,
    icon: string,
    title: string,
    subtitle?: string,
  ): TemplateResult | typeof nothing {
    if (!entityId) return nothing;
    const checked = this.hass.states[entityId]?.state === 'on';
    return html`
      <label class="setting-row">
        <span class="setting-icon"><ha-icon icon=${icon}></ha-icon></span>
        <span class="setting-copy">
          <strong>${title}</strong>${subtitle ? html`<small>${subtitle}</small>` : nothing}
        </span>
        <input
          class="switch-input"
          type="checkbox"
          .checked=${checked}
          @change=${(event: Event) =>
            this._switch(entityId, (event.currentTarget as HTMLInputElement).checked)}
        />
        <span class="switch" aria-hidden="true"></span>
      </label>
    `;
  }

  private _presetButton(preset: KettlePreset, entities: ResolvedKettleEntities): TemplateResult {
    const armed = this._armedKey === preset.key;
    return html`
      <button
        class=${classMap({ program: true, armed })}
        aria-pressed=${String(armed)}
        ?disabled=${this._busy}
        @click=${() => this._arm(preset.key, () => this._startPreset(entities, preset))}
      >
        <ha-icon icon=${preset.icon}></ha-icon>
        <strong>${preset.name}</strong>
        <small>${armed ? 'Tap again' : `${preset.target}°C`}</small>
      </button>
    `;
  }

  override render(): TemplateResult {
    const entities = this._resolve();
    if (!entities) {
      return html`<div class="notice">
        <ha-icon icon="mdi:alert-circle"></ha-icon>Unable to resolve this kettle’s entities.
      </div>`;
    }

    const heater = this.hass.states[entities.main];
    const attributes = heater?.attributes ?? {};
    const lifted = entities.lifted ? this.hass.states[entities.lifted]?.state === 'on' : false;
    const status = getStatus(heater, lifted);
    const current = attributes.current_temperature ?? attributes['kettle.temperature'] ?? '—';
    const values = this._values(entities);
    const attributeWarmingTime = Number(
      attributes['function.warming_time'] ?? attributes['function.warming-time'],
    );
    const warmingTime = numberState(
      this.hass,
      entities.warmingTime,
      Number.isFinite(attributeWarmingTime) ? attributeWarmingTime : 0,
    );
    const presetSource =
      attributes['function.extended_mode'] ?? attributes['function.extended-mode'] ?? '';
    const entityPresetIcons = attributes['xiaomi_kettle.preset_icons'];
    const presets = parsePresets(presetSource, {
      ...(typeof entityPresetIcons === 'object' && entityPresetIcons
        ? (entityPresetIcons as Record<string, string>)
        : {}),
      ...(this.presetIcons ?? {}),
    });
    const unavailable = !heater || heater.state === 'unavailable';
    const heating = status.code === 1 || status.code === 2;
    const active = heating || status.code === 4;
    const startArmed = this._armedKey === 'start';
    const boilArmed = !active && this._armedKey === 'boil';
    const armedPreset = presets.find((preset) => preset.key === this._armedKey);
    const displayValues = armedPreset ?? values;
    const targetMode = Number(
      attributes['function.target_mode'] ?? attributes['function.target-mode'],
    );
    const activeProgram =
      active && !status.fault && !status.lifted && Number.isFinite(targetMode)
        ? programNameForMode(targetMode, presets)
        : undefined;
    const remainingKeepWarm = remainingKeepWarmMinutes(
      displayValues.duration,
      armedPreset ? 0 : warmingTime,
    );
    const summary = [
      status.code === 4 && !armedPreset ? undefined : `Target ${displayValues.target}°C`,
      displayValues.keep ? `Keep ${displayValues.keepTemperature}°C` : undefined,
      displayValues.keep ? `${formatDuration(remainingKeepWarm)} left` : undefined,
    ]
      .filter((part): part is string => Boolean(part))
      .join(' · ');
    const confirmationStatus = boilArmed
      ? 'Tap again to boil'
      : armedPreset
        ? `Tap again · ${armedPreset.name}`
        : (activeProgram ?? status.label);

    return html`
      <main class=${classMap({ shell: true, 'card-mode': this.cardMode })}>
        <section class=${classMap({ hero: true, [status.tone]: true })}>
          <div class="temperature">
            <button
              class="temperature-value"
              type="button"
              aria-label="Open temperature history"
              title="Open temperature history"
              @click=${() => this._openTemperatureHistory(entities)}
            >
              <strong>${current}<small>°C</small></strong>
            </button>
            <div class="temperature-copy">
              <div
                class=${classMap({
                  status: true,
                  'action-armed': boilArmed || Boolean(armedPreset),
                })}
              >
                <span class="status-dot"></span
                ><span class="status-label">${confirmationStatus}</span>
              </div>
              <div class=${classMap({ 'hero-meta': true, preview: Boolean(armedPreset) })}>
                ${summary}
              </div>
            </div>
          </div>
          <div class="kettle-action">
            <button
              class=${classMap({ 'kettle-art': true, armed: boilArmed })}
              type="button"
              aria-label=${active ? 'Stop kettle' : boilArmed ? 'Tap again to boil' : 'Boil'}
              title=${active ? 'Stop kettle' : boilArmed ? 'Tap again to boil' : 'Boil'}
              aria-pressed=${String(!active && boilArmed)}
              ?disabled=${this._busy || unavailable || (active && !entities.stop)}
              @click=${() => {
                if (active) {
                  void this._run(() => this._stop(entities));
                  return;
                }
                this._arm('boil', () => {
                  const currentValues = this._values(entities);
                  return this._startBoil(
                    entities,
                    currentValues.keep,
                    currentValues.keepTemperature,
                    currentValues.duration,
                  );
                });
              }}
            >
              <ha-icon icon=${heating || boilArmed ? 'mdi:kettle-steam' : 'mdi:kettle'}></ha-icon>
            </button>
          </div>
        </section>

        ${
          this._error
            ? html`<div class="notice">
                <ha-icon icon="mdi:alert-circle"></ha-icon>${this._error}
              </div>`
            : nothing
        }

        <section class=${classMap({ offline: unavailable })}>
          ${
            this.showPresets
              ? html`
                  <div class="programs">
                    ${
                      presets.length
                        ? presets.map((preset) => this._presetButton(preset, entities))
                        : html`<p class="empty-programs">No kettle presets available</p>`
                    }
                  </div>
                `
              : nothing
          }
          ${
            !this.cardMode
              ? html`<label class="control-card">
                    <span class="control-copy">
                      <strong>Target temperature</strong><small>Choose from 40 to 99°C</small>
                    </span>
                    <span class="control-value">${values.target}°C</span>
                    <input
                      type="range"
                      min="40"
                      max="99"
                      step="1"
                      .value=${String(values.target)}
                      aria-label="Target temperature"
                      @input=${(event: Event) =>
                        (this._target = Number((event.currentTarget as HTMLInputElement).value))}
                      @change=${() =>
                        void this._run(() =>
                          this.hass.callService('water_heater', 'set_temperature', {
                            entity_id: entities.main,
                            temperature: this._values(entities).target,
                          }),
                        )}
                    />
                  </label>

                  <div class="keep-grid">
                    <label class="control-card switch-card">
                      <span class="setting-icon"><ha-icon icon="mdi:heat-wave"></ha-icon></span>
                      <span class="control-copy">
                        <strong>Keep warm</strong><small>Maintain temperature after heating</small>
                      </span>
                      <input
                        class="switch-input"
                        type="checkbox"
                        .checked=${values.keep}
                        @change=${(event: Event) => {
                          this._keep = (event.currentTarget as HTMLInputElement).checked;
                          this._switch(entities.keepWarm, this._keep);
                        }}
                      />
                      <span class="switch" aria-hidden="true"></span>
                    </label>

                    <label
                      class=${classMap({ 'control-card': true, disabled: !values.keep })}
                      aria-disabled=${String(!values.keep)}
                    >
                      <span class="control-copy"
                        ><strong>Temperature</strong><small>Keep-warm target</small></span
                      >
                      <span class="control-value">${values.keepTemperature}°C</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        .value=${String(values.keepTemperature)}
                        aria-label="Keep-warm temperature"
                        ?disabled=${this._busy || !values.keep}
                        @input=${(event: Event) =>
                          (this._keepTemperature = Number(
                            (event.currentTarget as HTMLInputElement).value,
                          ))}
                        @change=${() =>
                          this._setNumber(
                            entities.keepTemp,
                            this._values(entities).keepTemperature,
                          )}
                      />
                    </label>

                    <label
                      class=${classMap({ 'control-card': true, disabled: !values.keep })}
                      aria-disabled=${String(!values.keep)}
                    >
                      <span class="control-copy"
                        ><strong>Duration</strong><small>1 to 24 hours</small></span
                      >
                      <span class="control-value">${formatDuration(values.duration)}</span>
                      <input
                        type="range"
                        min="60"
                        max="1440"
                        step="30"
                        .value=${String(values.duration)}
                        aria-label="Keep-warm duration"
                        ?disabled=${this._busy || !values.keep}
                        @input=${(event: Event) =>
                          (this._keepDuration = Number(
                            (event.currentTarget as HTMLInputElement).value,
                          ))}
                        @change=${() => this._setNumber(entities.keepTime, this._values(entities).duration)}
                      />
                    </label>
                  </div>`
              : nothing
          }
          ${
            this.showControls
              ? html`<div class=${classMap({ actions: true, 'card-actions': this.cardMode })}>
                  ${
                    !this.cardMode
                      ? html`<button
                          class=${classMap({ button: true, primary: true, armed: startArmed })}
                          aria-pressed=${String(startArmed)}
                          ?disabled=${this._busy}
                          @click=${() =>
                            this._arm('start', () => {
                              const currentValues = this._values(entities);
                              return this._startManual(
                                entities,
                                currentValues.target,
                                currentValues.keep,
                                currentValues.keepTemperature,
                                currentValues.duration,
                              );
                            })}
                        >
                          <ha-icon
                            icon=${startArmed ? 'mdi:gesture-double-tap' : 'mdi:fire'}
                          ></ha-icon>
                          ${startArmed ? 'Tap again' : 'Start'}
                        </button>`
                      : nothing
                  }
                  <button
                    class=${classMap({ button: true, boil: true, armed: boilArmed })}
                    aria-pressed=${String(boilArmed)}
                    ?disabled=${this._busy}
                    @click=${() =>
                      this._arm('boil', () => {
                        const currentValues = this._values(entities);
                        return this._startBoil(
                          entities,
                          currentValues.keep,
                          currentValues.keepTemperature,
                          currentValues.duration,
                        );
                      })}
                  >
                    <ha-icon
                      icon=${boilArmed ? 'mdi:gesture-double-tap' : 'mdi:kettle-steam'}
                    ></ha-icon>
                    ${boilArmed ? 'Tap again' : 'Boil'}
                  </button>
                  <button
                    class="button stop"
                    ?disabled=${this._busy || !entities.stop}
                    @click=${() => entities.stop && void this._run(() => this._stop(entities))}
                  >
                    <ha-icon icon="mdi:stop-circle-outline"></ha-icon>Stop
                  </button>
                </div>`
              : nothing
          }
          ${
            this.showPreferences
              ? html`<details>
                  <summary>
                    <ha-icon icon="mdi:cog-outline"></ha-icon>Preferences
                    <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
                  </summary>
                  <div class="settings">
                    <div class="setting-row">
                      <span class="setting-icon">
                        <ha-icon
                          icon=${lifted ? 'mdi:kettle-alert' : 'mdi:kettle-outline'}
                        ></ha-icon>
                      </span>
                      <span class="setting-copy">
                        <strong>Kettle position</strong>
                        <small>${lifted ? 'Lifted from base' : 'Seated on base'}</small>
                      </span>
                    </div>
                    ${
                      entities.warmingTime
                        ? html`<div class="setting-row">
                            <span class="setting-icon"
                              ><ha-icon icon="mdi:timer-sand"></ha-icon
                            ></span>
                            <span class="setting-copy">
                              <strong>Kept warm</strong
                              ><small>${formatDuration(warmingTime)}</small>
                            </span>
                          </div>`
                        : nothing
                    }
                    ${this._toggleRow(entities.boilReminder, 'mdi:bell-ring-outline', 'Boiling reminder')}
                    ${this._toggleRow(entities.warmReminder, 'mdi:bell-ring-outline', 'Keep-warm reminder')}
                    ${this._toggleRow(
                      entities.liftMemory,
                      'mdi:memory',
                      'Resume after lifting',
                      'Remember the active keep-warm temperature',
                    )}
                    ${this._toggleRow(entities.customKnob, 'mdi:knob', 'Custom knob temperature')}
                    ${this._toggleRow(entities.noDisturb, 'mdi:moon-waning-crescent', 'Do not disturb')}
                  </div>
                </details>`
              : nothing
          }
        </section>
      </main>
    `;
  }
}

if (!customElements.get(CONTENT_TAG)) {
  customElements.define(CONTENT_TAG, XiaomiKettleDialogContent);
}

declare global {
  interface HTMLElementTagNameMap {
    [CONTENT_TAG]: XiaomiKettleDialogContent;
  }
}
