import { get } from 'superagent';
import { PagingOptions } from '../utils';
import { Announcement } from '../entity/announcement';

export async function findByCategory(
  categoryId: number,
  validUntil: Date,
  options: PagingOptions,
): Promise<Announcement[]> {
  if (!process.env.API_URL || !process.env.API_VERSION) {
    throw new Error('API URL has not been set');
  }

  const url = new URL(
    `api/v${process.env.API_VERSION}/announcements`,
    process.env.API_URL,
  );

  url.searchParams.append('category', categoryId.toString());
  url.searchParams.append('valid_until', validUntil.toISOString());

  if (options.limit) {
    url.searchParams.append('limit', options.limit.toString());
  }

  if (options.start) {
    url.searchParams.append('start', options.start.toString());
  }

  const result = await get(url.toString());

  if (!result.error && result.status === 200) {
    return result.body['data'] as Announcement[];
  }

  throw new Error('Error fetching from API');
}
