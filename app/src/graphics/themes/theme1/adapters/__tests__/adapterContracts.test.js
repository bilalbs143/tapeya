import { describe, expect, it } from 'vitest';

import { createTestSnapshot, PROCESSOR_MAP } from '@/graphics/core/processors/__tests__/fixtures';

import { TEST_TOKENS, THEME1_ADAPTER_CONTRACTS } from '../adapterContracts';

describe('theme1 adapter bundle contracts', () => {
  it.each(THEME1_ADAPTER_CONTRACTS.map((contract) => [contract.commandKey, contract]))(
    '%s adapter exposes required bundle keys',
    (commandKey, contract) => {
      const snapshot = createTestSnapshot({
        active_command: { command_key: commandKey },
        ...(contract.snapshotOverrides ?? {}),
      });

      const processor = PROCESSOR_MAP[commandKey];
      expect(processor, `missing processor for ${commandKey}`).toBeTypeOf('function');

      const props = processor(snapshot);
      expect(props).toBeTruthy();

      const bundle = contract.adapter(props, TEST_TOKENS);
      expect(bundle).toBeTruthy();

      for (const key of contract.requireKeys) {
        expect(bundle, `${commandKey} bundle missing "${key}"`).toHaveProperty(key);
        expect(bundle[key], `${commandKey}.${key} should not be null/undefined`).not.toBeNull();
        expect(bundle[key], `${commandKey}.${key} should not be undefined`).not.toBeUndefined();
      }
    },
  );
});
