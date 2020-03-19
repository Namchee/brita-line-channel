import { get } from 'superagent';
import { Category } from '../entity/category';

export async function findAll(): Promise<Category[]> {
  if (!process.env.API_URL || !process.env.API_VERSION) {
    throw new Error('API URL has not been set');
  }

  const url = new URL(
    `api/v${process.env.API_VERSION}/categories`,
    process.env.API_URL,
  );

  url.searchParams.append('count', 'false');

  const result = await get(url.toString());

  if (!result.error && result.status === 200) {
    return result.body['data'] as Category[];
  }

  throw new Error('Failed to fetch API');
}
