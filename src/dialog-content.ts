import { fireEvent } from 'custom-card-helpers';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ARM_TIMEOUT, CONTENT_TAG } from './constants';
import { resolveKettleEntities } from './device';
import { dialogStyles } from './dialog-styles';
import {
  formatDuration,
  getStatus,
  parsePresets,
  programNameForMode,
  remainingKeepWarmMinutes,
} from './kettle';
import { localize } from './localize';
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

  constructor() {
    super();
    this.entityId = '';
    this.cardMode = false;
    this.showControls = true;
    this.showPresets = true;
    this.showPreferences = true;
  }

  override disconnectedCallback(): void {
    window.clearTimeout(this._armTimer);
    super.disconnectedCallback();
  }

  private _resolve(): ResolvedKettleEntities | undefined {
    return this.hass && this.entityId ? resolveKettleEntities(this.hass, this.entityId) : undefined;
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
      : Promise.reject(new Error(localize(this.hass, 'dialog.stop_unavailable')));
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
      this._error =
        error instanceof Error ? error.message : localize(this.hass, 'dialog.command_failed');
    } finally {
      this._busy = false;
      this._armedKey = undefined;
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
        <small>${armed ? localize(this.hass, 'common.tap_again') : `${preset.target}°C`}</small>
      </button>
    `;
  }

  override render(): TemplateResult {
    const entities = this._resolve();
    if (!entities) {
      return html`<div class="notice">
        <ha-icon icon="mdi:alert-circle"></ha-icon>${localize(this.hass, 'dialog.resolve_error')}
      </div>`;
    }

    const language = this.hass.locale?.language;

    const heater = this.hass.states[entities.main];
    const attributes = heater?.attributes ?? {};
    const lifted = entities.lifted ? this.hass.states[entities.lifted]?.state === 'on' : false;
    const status = getStatus(heater, lifted, language);
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
        ? programNameForMode(targetMode, presets, language)
        : undefined;
    const remainingKeepWarm = remainingKeepWarmMinutes(
      displayValues.duration,
      armedPreset ? 0 : warmingTime,
    );
    const summary = [
      status.code === 4 && !armedPreset
        ? undefined
        : localize(this.hass, 'dialog.target_summary', {
            temperature: displayValues.target,
          }),
      displayValues.keep
        ? localize(this.hass, 'dialog.keep_summary', {
            temperature: displayValues.keepTemperature,
          })
        : undefined,
      displayValues.keep
        ? localize(this.hass, 'dialog.left_summary', {
            duration: formatDuration(remainingKeepWarm, language),
          })
        : undefined,
    ]
      .filter((part): part is string => Boolean(part))
      .join(' · ');
    const confirmationStatus = boilArmed
      ? localize(this.hass, 'dialog.tap_again_to_boil')
      : armedPreset
        ? localize(this.hass, 'dialog.tap_again_preset', { name: armedPreset.name })
        : (activeProgram ?? status.label);

    return html`
      <main class=${classMap({ shell: true, 'card-mode': this.cardMode })}>
        <section class=${classMap({ hero: true, [status.tone]: true })}>
          <div class="temperature">
            <button
              class="temperature-value"
              type="button"
              aria-label=${localize(this.hass, 'dialog.open_history')}
              title=${localize(this.hass, 'dialog.open_history')}
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
              aria-label=${
                active
                  ? localize(this.hass, 'dialog.stop_kettle')
                  : boilArmed
                    ? localize(this.hass, 'dialog.tap_again_to_boil')
                    : localize(this.hass, 'common.boil')
              }
              title=${
                active
                  ? localize(this.hass, 'dialog.stop_kettle')
                  : boilArmed
                    ? localize(this.hass, 'dialog.tap_again_to_boil')
                    : localize(this.hass, 'common.boil')
              }
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
                        : html`<p class="empty-programs">
                            ${localize(this.hass, 'dialog.no_presets')}
                          </p>`
                    }
                  </div>
                `
              : nothing
          }
          ${
            !this.cardMode
              ? html`<label class="control-card">
                    <span class="control-copy">
                      <strong>${localize(this.hass, 'dialog.target_temperature')}</strong
                      ><small>${localize(this.hass, 'dialog.target_temperature_help')}</small>
                    </span>
                    <span class="control-value">${values.target}°C</span>
                    <input
                      type="range"
                      min="40"
                      max="99"
                      step="1"
                      .value=${String(values.target)}
                      aria-label=${localize(this.hass, 'dialog.target_temperature')}
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
                        <strong>${localize(this.hass, 'dialog.keep_warm')}</strong
                        ><small>${localize(this.hass, 'dialog.keep_warm_help')}</small>
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
                        ><strong>${localize(this.hass, 'dialog.temperature')}</strong
                        ><small>${localize(this.hass, 'dialog.keep_warm_target')}</small></span
                      >
                      <span class="control-value">${values.keepTemperature}°C</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        .value=${String(values.keepTemperature)}
                        aria-label=${localize(this.hass, 'dialog.keep_warm_temperature')}
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
                        ><strong>${localize(this.hass, 'dialog.duration')}</strong
                        ><small>${localize(this.hass, 'dialog.duration_help')}</small></span
                      >
                      <span class="control-value"
                        >${formatDuration(values.duration, language)}</span
                      >
                      <input
                        type="range"
                        min="60"
                        max="1440"
                        step="30"
                        .value=${String(values.duration)}
                        aria-label=${localize(this.hass, 'dialog.keep_warm_duration')}
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
                          ${
                            startArmed
                              ? localize(this.hass, 'common.tap_again')
                              : localize(this.hass, 'common.start')
                          }
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
                    ${
                      boilArmed
                        ? localize(this.hass, 'common.tap_again')
                        : localize(this.hass, 'common.boil')
                    }
                  </button>
                  <button
                    class="button stop"
                    ?disabled=${this._busy || !entities.stop}
                    @click=${() => entities.stop && void this._run(() => this._stop(entities))}
                  >
                    <ha-icon icon="mdi:stop-circle-outline"></ha-icon
                    >${localize(this.hass, 'common.stop')}
                  </button>
                </div>`
              : nothing
          }
          ${
            this.showPreferences
              ? html`<details>
                  <summary>
                    <ha-icon icon="mdi:cog-outline"></ha-icon
                    >${localize(this.hass, 'dialog.preferences')}
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
                        <strong>${localize(this.hass, 'dialog.kettle_position')}</strong>
                        <small
                          >${
                            lifted
                              ? localize(this.hass, 'status.lifted')
                              : localize(this.hass, 'dialog.seated')
                          }</small
                        >
                      </span>
                    </div>
                    ${
                      entities.warmingTime
                        ? html`<div class="setting-row">
                            <span class="setting-icon"
                              ><ha-icon icon="mdi:timer-sand"></ha-icon
                            ></span>
                            <span class="setting-copy">
                              <strong>${localize(this.hass, 'dialog.kept_warm')}</strong
                              ><small>${formatDuration(warmingTime, language)}</small>
                            </span>
                          </div>`
                        : nothing
                    }
                    ${this._toggleRow(
                      entities.boilReminder,
                      'mdi:bell-ring-outline',
                      localize(this.hass, 'dialog.boiling_reminder'),
                    )}
                    ${this._toggleRow(
                      entities.warmReminder,
                      'mdi:bell-ring-outline',
                      localize(this.hass, 'dialog.keep_warm_reminder'),
                    )}
                    ${this._toggleRow(
                      entities.liftMemory,
                      'mdi:memory',
                      localize(this.hass, 'dialog.resume_after_lifting'),
                      localize(this.hass, 'dialog.resume_after_lifting_help'),
                    )}
                    ${this._toggleRow(
                      entities.customKnob,
                      'mdi:knob',
                      localize(this.hass, 'dialog.custom_knob'),
                    )}
                    ${this._toggleRow(
                      entities.noDisturb,
                      'mdi:moon-waning-crescent',
                      localize(this.hass, 'dialog.do_not_disturb'),
                    )}
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
