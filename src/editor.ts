import { fireEvent } from 'custom-card-helpers';
import { LitElement, css, html, type TemplateResult } from 'lit';
import { EDITOR_TAG } from './constants';
import { resolveKettleEntities } from './device';
import { parsePresets } from './kettle';
import type { KettlePreset } from './types';
import type { KettleCardConfig, KettleHass } from './types';

interface FormSchema {
  name: keyof KettleCardConfig;
  required?: boolean;
  selector: Record<string, unknown>;
}

const SCHEMA: FormSchema[] = [
  {
    name: 'entity',
    required: true,
    selector: { entity: { domain: 'water_heater' } },
  },
  { name: 'name', selector: { text: {} } },
  { name: 'icon', selector: { icon: {} } },
  { name: 'show_presets', selector: { boolean: {} } },
  { name: 'show_controls', selector: { boolean: {} } },
];

const LABELS: Record<string, string> = {
  entity: 'Kettle entity',
  name: 'Title',
  icon: 'Icon',
  show_presets: 'Show programs',
  show_controls: 'Show Boil and Stop controls',
};

export class XiaomiKettleCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static override styles = css`
    ha-form {
      display: block;
      padding: 4px 0;
    }

    .preset-icons {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-size: 15px;
      font-weight: 500;
    }

    p {
      margin-top: 3px;
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .preset-row {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr) minmax(150px, 46%);
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 8px 0;
    }

    .preset-row > ha-icon {
      color: var(--primary-color);
    }

    .preset-copy {
      min-width: 0;
    }

    .preset-copy strong,
    .preset-copy small {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preset-copy small {
      color: var(--secondary-text-color);
    }

    ha-selector {
      min-width: 0;
    }

    @media (max-width: 420px) {
      .preset-row {
        grid-template-columns: 28px minmax(0, 1fr);
      }

      .preset-row ha-selector {
        grid-column: 2;
      }
    }
  `;

  declare hass: KettleHass;
  private _config: KettleCardConfig = {
    type: 'custom:xiaomi-kettle-card',
    entity: '',
    show_controls: true,
    show_presets: true,
  };

  setConfig(config: KettleCardConfig): void {
    this._config = {
      show_controls: true,
      show_presets: true,
      ...config,
    };
  }

  private _label(schema: FormSchema): string {
    return LABELS[schema.name] ?? String(schema.name);
  }

  private _valueChanged(event: CustomEvent<{ value: KettleCardConfig }>): void {
    const config = { ...this._config, ...event.detail.value };
    if (!config.name) delete config.name;
    if (!config.icon) delete config.icon;
    this._setConfig(config);
  }

  private _setConfig(config: KettleCardConfig): void {
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  private _presets(): KettlePreset[] {
    if (!this.hass || !this._config.entity) return [];
    const entities = resolveKettleEntities(this.hass, this._config.entity);
    if (!entities) return [];
    const helperAttributes = this.hass.states[entities.main]?.attributes ?? {};
    const sourceAttributes = this.hass.states[entities.sourceMain]?.attributes ?? {};
    const source =
      helperAttributes['function.extended_mode'] ??
      helperAttributes['function.extended-mode'] ??
      sourceAttributes['function.extended_mode'] ??
      sourceAttributes['function.extended-mode'];
    const kettleIcons = helperAttributes['xiaomi_kettle.preset_icons'];
    return parsePresets(source, {
      ...(typeof kettleIcons === 'object' && kettleIcons
        ? (kettleIcons as Record<string, string>)
        : {}),
      ...(this._config.preset_icons ?? {}),
    });
  }

  private _presetIconChanged(preset: KettlePreset, event: CustomEvent<{ value?: string }>): void {
    const icons = { ...this._config.preset_icons };
    const value = event.detail.value?.trim();
    if (value) icons[preset.name] = value;
    else delete icons[preset.name];
    const config: KettleCardConfig = { ...this._config, preset_icons: icons };
    if (!Object.keys(icons).length) delete config.preset_icons;
    this._setConfig(config);
  }

  override render(): TemplateResult {
    const presets = this._presets();
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
      ${
        presets.length
          ? html`<section class="preset-icons">
              <h3>Program icons</h3>
              <p>Choose an icon for each preset discovered from Xiaomi Home.</p>
              ${presets.map(
                (preset) =>
                  html`<div class="preset-row">
                    <ha-icon icon=${preset.icon}></ha-icon>
                    <span class="preset-copy">
                      <strong>${preset.name}</strong>
                      <small>${preset.target}°C</small>
                    </span>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ icon: {} }}
                      .value=${this._config.preset_icons?.[preset.name] ?? preset.icon}
                      .label=${`${preset.name} icon`}
                      @value-changed=${(event: CustomEvent<{ value?: string }>) =>
                        this._presetIconChanged(preset, event)}
                    ></ha-selector>
                  </div>`,
              )}
            </section>`
          : ''
      }
    `;
  }
}

if (!customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, XiaomiKettleCardEditor);
}

declare global {
  interface HTMLElementTagNameMap {
    [EDITOR_TAG]: XiaomiKettleCardEditor;
  }
}
