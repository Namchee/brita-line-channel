import { Client, MessageAPIResponseBase, TextMessage } from '@line/bot-sdk';
import { SubscriptionRepository } from '../repository/subscription';
import { Announcement } from '../entity/announcement';

export class PusherService {
  public constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly client: Client,
  ) {}

  public pushMessages = async (
    announcement: Announcement,
  ): Promise<MessageAPIResponseBase[]> => {
    const users: string[] = [];

    announcement.categories.forEach(async (c) => {
      const categoryUser = await this.subscriptionRepository
        .getMatchingSubscriptions(c.name);

      users.push(...categoryUser);
    });

    const messages = users.map((u) => {
      const introMessage: TextMessage = {
        type: 'text',
        text: 'Terdapat pengumuman baru yang sesuai dengan subscription kamu.',
      };

      return this.client.pushMessage(
        u,
        [introMessage, this.messageFormatter(announcement)],
      );
    });

    return Promise.all(messages);
  }

  private messageFormatter = (announcement: Announcement): TextMessage => {
    const text = `**${announcement.title}**
    
${announcement.contents}`;

    return {
      type: 'text',
      text,
    };
  }
}
