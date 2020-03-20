import { get } from 'superagent';
import { PagingOptions, UserError } from '../utils';
import { Announcement } from '../entity/announcement';
import { REPLY } from '../reply';

export async function findByCategory(
  category: string,
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

  url.searchParams.append('category', category);
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

  if (result.error && result.status === 404) {
    throw new UserError(REPLY.UNKNOWN_CATEGORY);
  }

  throw new Error('Error fetching from API');
}
