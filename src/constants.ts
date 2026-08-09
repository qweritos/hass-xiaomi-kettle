export const CARD_TAG = 'xiaomi-kettle-card';
export const EDITOR_TAG = 'xiaomi-kettle-card-editor';
export const CONTENT_TAG = 'xiaomi-kettle-dialog-content';
export const REPOSITORY_URL = 'https://github.com/qweritos/hass-xiaomi-kettle';
export const SUPPORTED_MODELS = new Set(['yunmi.kettle.v19']);
export const DEFAULT_POLL_INTERVAL = 5;
export const ARM_TIMEOUT = 1_000;

export const ENTITY_SUFFIXES = {
  lifted: 'kettle_lifting',
  stop: 'stop_work',
  keepWarm: 'auto_keep_warm',
  keepTemp: 'keep_warm_temperature',
  keepTime: 'keep_warm_time',
  warmingTime: 'warming_time',
  boilReminder: 'boiling_reminder',
  warmReminder: 'keep_warm_reminder',
  liftMemory: 'lift_remember_temp',
  customKnob: 'custom_knob_temp',
  noDisturb: 'no_disturb',
} as const;
