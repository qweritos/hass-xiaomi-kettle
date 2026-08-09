import type { KettleHass } from './types';

declare global {
  const __CARD_VERSION__: string;

  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description?: string;
      preview?: boolean;
      documentationURL?: string;
      getEntitySuggestion?: (
        hass: KettleHass,
        entityId: string,
      ) => { config: Record<string, unknown> } | null;
    }>;
  }
}
