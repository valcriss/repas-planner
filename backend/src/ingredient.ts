import { randomUUID } from 'crypto';
import { PoolClient } from 'pg';

export async function findOrCreateIngredient(
  client: PoolClient,
  nom: string,
  uniteId: string | null
): Promise<string> {
  const existing = await client.query('SELECT id FROM ingredients WHERE nom = $1', [nom]);
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  const id = randomUUID();
  await client.query('INSERT INTO ingredients (id, nom, unite_id) VALUES ($1, $2, $3)', [id, nom, uniteId]);
  return id;
}
