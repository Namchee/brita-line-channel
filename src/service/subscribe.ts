import { SubscriptionRepository } from '../repository/subscription';
import { CategoryRepository } from '../repository/category';
import {
  BotService,
  BotServiceParameters,
  BotServiceResult,
  HandlerParameters,
} from './base';
import { REPLY } from '../reply';
import { generateQuickReplyObject } from '../utils/lineFormatter';

export class SubscribeService extends BotService {
  public constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {
    super('subscribe');

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
    }: BotServiceParameters,
  ): Promise<BotServiceResult> => {
    return this.handler[state]({ id, text, timestamp });
  }

  public handleFirstState = async (): Promise<BotServiceResult> => {
    const categories = await this.categoryRepository.findAll();

    let text = REPLY.SUBSCRIBE_CATEGORY + '\n\n';

    for (let i = 0; i < categories.length; i++) {
      if (i) {
        text += '\n';
      }

      text += `- ${categories[i].name}`;
    }

    return {
      state: 1,
      message: [
        {
          type: 'text',
          text,
          quickReply: {
            items: categories
              .map(c => generateQuickReplyObject(c.name, c.name)),
          },
        },
      ],
    };
  }

  public handleSecondState = async (
    {
      id,
      text,
    }: HandlerParameters,
  ): Promise<BotServiceResult> => {
    const exist = await this.categoryRepository.exists(text);

    if (!exist) {
      return {
        state: 1,
        message: [
          {
            type: 'text',
            text: REPLY.UNKNOWN_CATEGORY,
          },
          ...(await this.handleFirstState()).message,
        ],
      };
    }

    await this.subscriptionRepository.addSubscription(
      id,
      text,
    );

    return {
      state: 0,
      message: [
        {
          type: 'text',
          text: REPLY.SUBCRIPTION_SUCCESS,
        },
      ],
    };
  }
}
