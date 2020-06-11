import { SubscriptionRepository } from '../repository/subscription';
import {
  BotService,
  BotServiceParameters,
  BotServiceResult,
  HandlerParameters,
} from './base';
import { REPLY, LOGIC_ERROR } from '../reply';
import { generateQuickReplyObject } from '../utils/lineFormatter';
import { capitalize } from '../utils/capitalize';

export class UnsubscribeService extends BotService {
  public constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {
    super('unsubscribe');

    this.handler = [
      this.handleFirstState,
      this.handleSecondState,
    ];
  }

  public handle = async (
    {
      id,
      state,
      text,
      timestamp,
      misc,
    }: BotServiceParameters,
  ): Promise<BotServiceResult> => {
    return this.handler[state]({ id, text, timestamp, misc });
  }

  public handleFirstState = async (
    {
      id,
    }: HandlerParameters,
  ): Promise<BotServiceResult> => {
    const subscription = await this.subscriptionRepository
      .getUserSubscription(id);

    if (!subscription) {
      return {
        state: 0,
        message: [
          {
            type: 'text',
            text: REPLY.NO_SUBSCRIPTION,
            quickReply: {
              items: [
                generateQuickReplyObject(
                  REPLY.END_REQUEST_LABEL,
                  REPLY.END_REQUEST_TEXT,
                ),
              ],
            },
          },
        ],
      };
    }

    const categories = subscription.categories;
    let text = REPLY.UNSUBSCRIBE_CATEGORY + '\n\n';

    for (let i = 0; i < categories.length; i++) {
      if (i) {
        text += '\n';
      }

      text += `- ${categories[i]}`;
    }

    return {
      state: 1,
      message: [
        {
          type: 'text',
          text,
          quickReply: {
            items: categories.map(c => generateQuickReplyObject(c, c)),
          },
        },
      ],
      misc: {
        'categories': categories,
      },
    };
  }

  public handleSecondState = async (
    {
      id,
      text,
      timestamp,
      misc,
    }: HandlerParameters,
  ): Promise<BotServiceResult> => {
    if (text === REPLY.END_REQUEST_TEXT.toLowerCase()) {
      return {
        state: 0,
        message: [
          {
            type: 'text',
            text: REPLY.END_REQUEST_REPLY,
          },
        ],
      };
    }

    if (!misc) {
      throw new Error(LOGIC_ERROR.CACHE_NOT_SET);
    }

    const subscriptions: string[] = misc['categories'];

    if (!subscriptions.includes(capitalize(text))) {
      return {
        state: 1,
        message: [
          {
            type: 'text',
            text: REPLY.NOT_SUBSCRIBED,
          },
          ...(await this.handleFirstState({ id, text, timestamp })).message,
        ],
        misc,
      };
    }

    await this.subscriptionRepository.deleteSubscription(id, text);

    return {
      state: 0,
      message: [
        {
          type: 'text',
          text: REPLY.UNSUBSCRIBED,
        },
      ],
    };
  }
}
