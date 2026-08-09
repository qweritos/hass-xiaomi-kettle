import { describe, expect, it, vi } from 'vitest';
import { startBoil } from '../src/miot';
import type { KettleHass } from '../src/types';

function hassWithResponse(result: Array<{ code: number }>): KettleHass {
  return {
    callService: vi.fn().mockResolvedValue({ response: { result } }),
  } as unknown as KettleHass;
}

describe('MIoT property batches', () => {
  it('accepts a partially successful batch for source reconciliation', async () => {
    const hass = hassWithResponse([{ code: 0 }, { code: -4004 }]);

    await expect(startBoil(hass, 'water_heater.kettle', true, 70, 1_440)).resolves.toBeUndefined();
  });

  it('reports a completely rejected batch', async () => {
    const hass = hassWithResponse([{ code: -4004 }, { code: -4004 }]);

    await expect(startBoil(hass, 'water_heater.kettle', true, 70, 1_440)).rejects.toThrow(
      'Kettle command was rejected',
    );
  });
});
