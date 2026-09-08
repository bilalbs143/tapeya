// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

import { uploadReelPartWithProgress } from '../uploadReelPartWithProgress';

describe('uploadReelPartWithProgress', () => {
  it('resolves on 2xx and reports loaded bytes', async () => {
    const loaded = [];
    class FakeXHR {
      constructor() {
        this.upload = { onprogress: null };
        this.status = 0;
        this.responseText = '';
        this.timeout = 0;
      }

      open() {}

      setRequestHeader() {}

      send() {
        queueMicrotask(() => {
          this.upload.onprogress?.({ lengthComputable: true, loaded: 40, total: 100 });
          this.upload.onprogress?.({ lengthComputable: true, loaded: 100, total: 100 });
          this.status = 200;
          this.responseText = JSON.stringify({ data: { part_number: 1 } });
          this.onload?.();
        });
      }
    }

    vi.stubGlobal('XMLHttpRequest', FakeXHR);

    await expect(
      uploadReelPartWithProgress({
        reelId: 7,
        uploadId: 'u1',
        partNumber: 1,
        file: new Blob([new Uint8Array(100)]),
        accessToken: 'tok',
        onUploadProgress: (n) => loaded.push(n),
      }),
    ).resolves.toEqual({ part_number: 1 });

    expect(loaded).toEqual([40, 100]);
  });
});
