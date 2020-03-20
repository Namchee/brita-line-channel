import { Message } from '@line/bot-sdk';
import { StringMap } from './../utils';

export interface BotServiceParameters {
  state: number;
  text: string;
  timestamp: number;
  misc?: StringMap;
}

export interface HandlerParameters {
  text: string;
  timestamp: number;
  misc?: StringMap;
}

export interface BotServiceResult {
  state: number;
  message: Message[];
  misc?: StringMap;
}

export type BotServiceHandler = (
  params: HandlerParameters,
) => Promise<BotServiceResult>;

export abstract class BotService {
  public readonly identifier: string;
  protected handler: BotServiceHandler[];

  public constructor(identifier: string) {
    this.identifier = identifier;
  }

  public abstract handle(
    params: BotServiceParameters,
  ): Promise<BotServiceResult>;
}
