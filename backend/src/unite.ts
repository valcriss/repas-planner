import { randomUUID } from 'crypto';
import { PoolClient } from 'pg';

export async function findOrCreateUnite(client: PoolClient, nom?: string): Promise<string | null> {
  if (!nom) {
    return null;
  }
  let result = await client.query('SELECT id FROM unites WHERE nom = $1', [nom]);
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  const id = randomUUID();
  await client.query('INSERT INTO unites (id, nom) VALUES ($1, $2)', [id, nom]);
  return id;
}
