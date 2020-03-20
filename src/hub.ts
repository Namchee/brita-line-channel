import {
  WebhookEvent,
  MessageAPIResponseBase,
  Client,
  Message,
  MessageEvent,
} from '@line/bot-sdk';
import { StateRepository } from './repository/state';
import { BotService } from './service/base';
import { REPLY } from './reply';
import { StringMap } from './utils';

export class ServiceHub {
  public constructor(
    private readonly client: Client,
    private readonly serviceMap: StringMap,
    private readonly stateRepository: StateRepository,
  ) { }

  public handleBotQuery = async (
    event: WebhookEvent,
  ): Promise<MessageAPIResponseBase | null> => {
    if (
      event.type !== 'message' ||
      event.message.type !== 'text' ||
      event.source.type != 'user'
    ) {
      return Promise.resolve(null);
    }

    const userId = event.source.userId.trim().toLowerCase();
    const text = event.message.text.trim().toLowerCase();
    const timestamp = event.timestamp;

    const userState = await this.stateRepository.findById(userId);

    const state = userState ? userState.state : 0;

    const service: BotService = userState ?
      this.serviceMap[userState.service] :
      this.serviceMap[text];

    if (!service && !userState) {
      const message: Message = {
        type: 'text',
        text: REPLY.UNIDENTIFIABLE,
      };

      return this.sendMessage(event, [message]);
    }

    try {
      const queryResult = await service.handle(
        {
          state,
          text,
          timestamp,
          misc: userState?.misc,
        },
      );

      if (queryResult.state >= 0) {
        await this.updateUserState(
          userId,
          service.identifier,
          queryResult.state,
          queryResult.misc,
          !!userState,
        );
      }

      return await this.sendMessage(event, queryResult.message);
    } catch (err) {
      const errorMessage: Message = {
        type: 'text',
        text: REPLY.SERVER_ERROR,
      };

      await this.sendMessage(event, [errorMessage]);

      throw err;
    }
  }

  private updateUserState = async (
    userId: string,
    serviceId: string,
    state: number,
    misc?: StringMap,
    exist?: boolean,
  ): Promise<boolean> => {
    if (!exist) {
      if (state === 0) {
        return true;
      }

      return await this.stateRepository.create(
        userId,
        serviceId,
        state,
        misc,
      );
    } else {
      if (state === 0) {
        return await this.stateRepository.delete(userId);
      } else {
        return await this.stateRepository.update({
          id: userId,
          service: serviceId,
          state,
          misc,
        });
      }
    }
  }

  private sendMessage = (
    event: MessageEvent,
    message: Message[],
  ): Promise<MessageAPIResponseBase> => {
    if (message.length > 1) {
      return this.client.pushMessage(
        event.source.userId || '',
        message,
      );
    } else {
      return this.client.replyMessage(event.replyToken, message);
    }
  }
}
