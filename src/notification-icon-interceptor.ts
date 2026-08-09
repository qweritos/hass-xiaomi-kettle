const NOTIFICATION_TAG = 'persistent-notification-item';
const NOTIFICATION_PREFIX = 'xiaomi_kettle_';
const ICON_URL = '/xiaomi-kettle/icon.png';
const ICON_ATTRIBUTE = 'data-xiaomi-kettle-icon';

interface PersistentNotification {
  notification_id?: string;
}

interface PersistentNotificationItem extends HTMLElement {
  notification?: PersistentNotification;
}

interface PersistentNotificationPrototype extends PersistentNotificationItem {
  updated?(changedProperties: Map<PropertyKey, unknown>): unknown;
  __xiaomiKettleIconPatched?: boolean;
}

type PersistentNotificationConstructor = CustomElementConstructor & {
  prototype: PersistentNotificationPrototype;
};

function syncIcon(item: PersistentNotificationItem): void {
  const root = item.shadowRoot;
  if (!root) return;

  const existing = root.querySelector<HTMLImageElement>(`img[${ICON_ATTRIBUTE}]`);
  const isKettle = item.notification?.notification_id?.startsWith(NOTIFICATION_PREFIX) === true;
  if (!isKettle) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const header = root.querySelector<HTMLElement>('[slot="header"]');
  if (!header?.parentElement) return;

  const icon = document.createElement('img');
  icon.setAttribute(ICON_ATTRIBUTE, '');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('slot', 'header');
  icon.src = ICON_URL;
  icon.alt = '';
  icon.style.cssText = [
    'width:32px',
    'height:32px',
    'object-fit:contain',
    'vertical-align:middle',
    'margin-inline-end:10px',
  ].join(';');
  header.before(icon);
}

function syncExisting(root: Document | ShadowRoot): void {
  for (const element of root.querySelectorAll<HTMLElement>('*')) {
    if (element.localName === NOTIFICATION_TAG) {
      syncIcon(element as PersistentNotificationItem);
    }
    if (element.shadowRoot) syncExisting(element.shadowRoot);
  }
}

export async function installNotificationIconInterceptor(): Promise<void> {
  await customElements.whenDefined(NOTIFICATION_TAG);
  const constructor = customElements.get(NOTIFICATION_TAG) as
    PersistentNotificationConstructor | undefined;
  const prototype = constructor?.prototype;
  if (!prototype || prototype.__xiaomiKettleIconPatched) return;

  const originalUpdated = prototype.updated;
  prototype.__xiaomiKettleIconPatched = true;
  prototype.updated = function updateXiaomiKettleNotificationIcon(
    changedProperties: Map<PropertyKey, unknown>,
  ): unknown {
    const result = originalUpdated?.call(this, changedProperties);
    queueMicrotask(() => syncIcon(this));
    return result;
  };

  queueMicrotask(() => syncExisting(document));
}
