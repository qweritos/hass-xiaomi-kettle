import { CONTENT_TAG } from './constants';
import { isSupportedKettleEntity } from './device';
import type { XiaomiKettleDialogContent } from './dialog-content';
import type { KettleHass } from './types';

interface MoreInfoParams {
  entityId: string;
  view?: string;
  [key: string]: unknown;
}

interface MoreInfoDialog extends HTMLElement {
  hass: KettleHass;
  _currView?: string;
  __xiaomiKettleContent?: boolean;
  __xiaomiKettleSourceEntity?: string;
}

interface MoreInfoPrototype extends MoreInfoDialog {
  showDialog(params: MoreInfoParams): unknown;
  updated?(changedProperties: Map<PropertyKey, unknown>): unknown;
  __xiaomiKettlePatched?: boolean;
}

type MoreInfoConstructor = CustomElementConstructor & { prototype: MoreInfoPrototype };

function restoreNativeChildren(content: HTMLElement, customContent?: Element): void {
  for (const child of Array.from(content.children)) {
    if (child === customContent) continue;
    const element = child as HTMLElement;
    element.hidden = false;
    element.inert = false;
    element.removeAttribute('aria-hidden');
    element.style.removeProperty('display');
  }
}

function syncContent(dialog: MoreInfoDialog): void {
  const content = dialog.shadowRoot?.querySelector<HTMLElement>('.content');
  if (!content) return;

  let customContent = content.querySelector<XiaomiKettleDialogContent>(`:scope > ${CONTENT_TAG}`);
  const replace = dialog.__xiaomiKettleContent === true && dialog._currView === 'info';

  if (!replace) {
    restoreNativeChildren(content, customContent ?? undefined);
    customContent?.remove();
    return;
  }

  for (const child of Array.from(content.children)) {
    if (child === customContent) continue;
    const element = child as HTMLElement;
    element.hidden = true;
    element.inert = true;
    element.setAttribute('aria-hidden', 'true');
    element.style.setProperty('display', 'none', 'important');
  }

  if (!customContent) {
    customContent = document.createElement(CONTENT_TAG);
    content.append(customContent);
  }
  customContent.hass = dialog.hass;
  customContent.entityId = dialog.__xiaomiKettleSourceEntity ?? '';
}

export async function installMoreInfoInterceptor(): Promise<void> {
  await customElements.whenDefined('ha-more-info-dialog');
  const constructor = customElements.get('ha-more-info-dialog') as MoreInfoConstructor | undefined;
  const prototype = constructor?.prototype;
  if (!prototype || prototype.__xiaomiKettlePatched) return;

  const originalShowDialog = prototype.showDialog;
  const originalUpdated = prototype.updated;
  prototype.__xiaomiKettlePatched = true;

  prototype.showDialog = function showXiaomiKettleDialog(params: MoreInfoParams): unknown {
    const replace = isSupportedKettleEntity(
      params.entityId ? this.hass : undefined,
      params.entityId,
    );
    this.__xiaomiKettleContent = replace;
    this.__xiaomiKettleSourceEntity = replace ? params.entityId : undefined;
    return originalShowDialog.call(this, params);
  };

  prototype.updated = function updateXiaomiKettleContent(
    changedProperties: Map<PropertyKey, unknown>,
  ): unknown {
    const result = originalUpdated?.call(this, changedProperties);
    queueMicrotask(() => syncContent(this));
    return result;
  };
}
