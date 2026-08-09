import type { KettleHass, KettlePreset } from './types';

interface MiotProperty {
  did: string;
  siid: number;
  piid: number;
  value: boolean | number | string;
}

interface MiotResult {
  code?: number;
}

interface ServiceResponse {
  response?: { result?: MiotResult[] };
  service_response?: { result?: MiotResult[] };
  result?: MiotResult[];
}

type ResponseServiceCall = (
  domain: string,
  service: string,
  serviceData?: Record<string, unknown>,
  target?: Record<string, unknown>,
  returnResponse?: boolean,
) => Promise<ServiceResponse>;

async function sendProperties(
  hass: KettleHass,
  entityId: string,
  properties: MiotProperty[],
): Promise<void> {
  const callService = hass.callService.bind(hass) as unknown as ResponseServiceCall;
  const response = await callService(
    'xiaomi_miot',
    'send_command',
    { entity_id: entityId, method: 'set_properties', params: properties },
    undefined,
    true,
  );
  const result =
    response?.response?.result ?? response?.service_response?.result ?? response?.result ?? [];
  const failures = result.filter((item) => Number(item.code) !== 0);
  if (result.length && failures.length === result.length) {
    throw new Error('Kettle command was rejected');
  }
}

export function startPreset(
  hass: KettleHass,
  entityId: string,
  preset: KettlePreset,
): Promise<void> {
  return sendProperties(hass, entityId, [
    { did: 'set-2-4', siid: 2, piid: 4, value: preset.target },
    { did: 'set-2-5', siid: 2, piid: 5, value: preset.keep },
    { did: 'set-2-6', siid: 2, piid: 6, value: preset.keepTemperature },
    { did: 'set-3-1', siid: 3, piid: 1, value: preset.duration },
    { did: 'set-3-11', siid: 3, piid: 11, value: preset.mode },
  ]);
}

export function startManual(
  hass: KettleHass,
  entityId: string,
  target: number,
  keep: boolean,
  keepTemperature: number,
  duration: number,
): Promise<void> {
  return sendProperties(hass, entityId, [
    { did: 'set-2-4', siid: 2, piid: 4, value: target },
    { did: 'set-2-5', siid: 2, piid: 5, value: keep },
    { did: 'set-2-6', siid: 2, piid: 6, value: keepTemperature },
    { did: 'set-3-1', siid: 3, piid: 1, value: duration },
    { did: 'set-3-11', siid: 3, piid: 11, value: 0 },
    {
      did: 'set-3-12',
      siid: 3,
      piid: 12,
      value: `${target},${keep ? 1 : 0},${keepTemperature},${duration}`,
    },
  ]);
}

export function startBoil(
  hass: KettleHass,
  entityId: string,
  keep: boolean,
  keepTemperature: number,
  duration: number,
): Promise<void> {
  return sendProperties(hass, entityId, [
    { did: 'set-2-4', siid: 2, piid: 4, value: 99 },
    { did: 'set-2-5', siid: 2, piid: 5, value: keep },
    { did: 'set-2-6', siid: 2, piid: 6, value: keepTemperature },
    { did: 'set-3-1', siid: 3, piid: 1, value: duration },
    { did: 'set-3-11', siid: 3, piid: 11, value: 1 },
    {
      did: 'set-3-13',
      siid: 3,
      piid: 13,
      value: `99,${keep ? 1 : 0},${keepTemperature},${duration}`,
    },
  ]);
}
