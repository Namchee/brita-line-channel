import { post } from 'superagent';
import { PagingOptions } from '../utils';
import { Announcement } from '../entity/announcement';
import { GraphCMSConsumer } from './apiConsumer';
import { capitalize } from '../utils/capitalize';

export class AnnouncementRepository extends GraphCMSConsumer {
  public constructor(
    protected readonly url: string,
    protected readonly token: string,
  ) {
    super(url, token);
  }

  public findByCategory = async (
    category: string,
    validUntil: Date,
    options: PagingOptions,
  ): Promise<Announcement[]> => {
    const query = `
      {
        announcements(
          where: {
            categories_some: {
              name: "${capitalize(category)}"
            },
            validUntil_gte: "${validUntil.toISOString()}"
          },
          orderBy: validUntil_ASC,
          stage: PUBLISHED,
          first: ${options.limit},
          skip: ${options.start}
        ) {
          title,
          contents
        }
      }
    `;

    const request = post(this.url)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.token}`)
      .send(JSON.stringify({ query }));

    const result = await request;

    return result.body['data']['announcements'] as Announcement[];
  }
}
