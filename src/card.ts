import { fireEvent } from 'custom-card-helpers';
import { LitElement, css, html, type TemplateResult } from 'lit';
import { CARD_TAG, EDITOR_TAG, REPOSITORY_URL } from './constants';
import type { KettleCardConfig, KettleHass } from './types';

export class XiaomiKettleCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static override styles = css`
    ha-card {
      min-width: 0;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 14px 16px 4px;
      border: 0;
      color: var(--primary-text-color);
      background: transparent;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .header > ha-icon:first-child {
      color: var(--primary-color);
      --mdc-icon-size: 25px;
    }

    .header-copy {
      flex: 1;
      min-width: 0;
    }

    .header-copy strong {
      display: block;
      overflow: hidden;
      font-size: 15px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .error {
      display: block;
      padding: 16px;
      color: var(--error-color);
    }

    .loading {
      display: grid;
      gap: 12px;
      padding: 16px;
    }

    .loading-header {
      display: flex;
      align-items: center;
      gap: 11px;
      color: var(--primary-text-color);
    }
  `;

  declare hass: KettleHass;
  private _config?: KettleCardConfig;

  static getStubConfig(): KettleCardConfig {
    return {
      type: `custom:${CARD_TAG}`,
      entity: '',
      show_controls: true,
      show_presets: true,
    };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  setConfig(config: KettleCardConfig): void {
    if (!config.entity && config.entity !== '')
      throw new Error('Please configure a kettle entity.');
    this._config = { show_controls: true, show_presets: true, ...config };
  }

  getCardSize(): number {
    return (
      3 +
      (this._config?.show_presets === false ? 0 : 2) +
      (this._config?.show_controls === false ? 0 : 1)
    );
  }

  private _open(): void {
    if (!this._config?.entity) return;
    fireEvent(this, 'hass-more-info', { entityId: this._config.entity });
  }

  override render(): TemplateResult {
    const entityId = this._config?.entity;
    if (!entityId) {
      return html`<ha-card class="error">Select a yunmi.kettle.v19 water heater entity.</ha-card>`;
    }
    const entity = this.hass?.states?.[entityId];
    if (!entity) {
      return html`<ha-card class="loading" aria-label="Kettle is loading">
        <div class="loading-header">
          <ha-icon icon=${this._config?.icon ?? 'mdi:kettle-outline'}></ha-icon>
          <strong>${this._config?.name ?? 'Kettle'}</strong>
        </div>
        <hui-warning>Home Assistant is starting. Not everything may be available yet.</hui-warning>
      </ha-card>`;
    }

    const name = this._config?.name ?? entity.attributes.friendly_name ?? 'Kettle';
    const statusCode = Number(entity.attributes['kettle.status']);
    const heating = statusCode === 1 || statusCode === 2;
    const icon = this._config?.icon ?? (heating ? 'mdi:kettle-steam' : 'mdi:kettle');

    return html`
      <ha-card>
        <button class="header" type="button" @click=${this._open} aria-label="Open kettle dialog">
          <ha-icon icon=${icon}></ha-icon>
          <span class="header-copy"><strong>${name}</strong></span>
        </button>
        <xiaomi-kettle-dialog-content
          .hass=${this.hass}
          .entityId=${entityId}
          .cardMode=${true}
          .showControls=${this._config?.show_controls !== false}
          .showPresets=${this._config?.show_presets !== false}
          .showPreferences=${false}
          .presetIcons=${this._config?.preset_icons}
        ></xiaomi-kettle-dialog-content>
      </ha-card>
    `;
  }
}

if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, XiaomiKettleCard);

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: 'Xiaomi Kettle Card',
    description: 'Status and controls for Xiaomi Smart Kettle 2 Pro',
    documentationURL: REPOSITORY_URL,
    preview: true,
    getEntitySuggestion: (hass, entityId) => {
      const deviceId = hass.entities?.[entityId]?.device_id;
      const model = deviceId ? hass.devices?.[deviceId]?.model?.toLowerCase() : undefined;
      const source = hass.states?.[entityId]?.attributes?.['xiaomi_kettle.source_entity_id'];
      return model === 'yunmi.kettle.v19' || typeof source === 'string'
        ? {
            config: {
              type: `custom:${CARD_TAG}`,
              entity: entityId,
              show_controls: true,
              show_presets: true,
            },
          }
        : null;
    },
  });
}

declare global {
  interface HTMLElementTagNameMap {
    [CARD_TAG]: XiaomiKettleCard;
  }
}
