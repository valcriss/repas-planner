import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findOrCreateUnite } from '../src/unite';

vi.mock('crypto', async () => {
  const actual = await vi.importActual<typeof import('crypto')>('crypto');
  return { ...actual, randomUUID: vi.fn(() => 'uuid') };
});

describe('findOrCreateUnite', () => {
  const client = { query: vi.fn() } as unknown as { query: vi.Mock };

  beforeEach(() => {
    client.query.mockReset();
  });

  it('returns null when name is missing', async () => {
    const res = await findOrCreateUnite(client, undefined);
    expect(res).toBeNull();
    expect(client.query).not.toHaveBeenCalled();
  });

  it('returns existing id if found', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ id: 'abc' }] });
    const res = await findOrCreateUnite(client, 'kg');
    expect(res).toBe('abc');
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it('inserts when not found', async () => {
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});
    const res = await findOrCreateUnite(client, 'kg');
    expect(res).toBe('uuid');
    expect(client.query).toHaveBeenCalledTimes(2);
  });
});
