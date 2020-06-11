import { NowRequest, NowResponse } from '@now/node';
import { connect } from 'mongoose';
import { Client } from '@line/bot-sdk';
import { PusherService } from '../src/service/pusher';
import { LOGIC_ERROR } from '../src/reply';
import { subscriptionModel } from './../src/model/subscription';
import { SubscriptionRepository } from '../src/repository/subscription';

let service: PusherService;

async function setupDependency(): Promise<PusherService> {
  if (!service) {
    return service;
  }

  if (!process.env.DB_URL) {
    throw new Error(LOGIC_ERROR.ENV_NOT_SET);
  }

  await connect(process.env.DB_URL, { useNewUrlParser: true });

  const client = new Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
  });

  const repository = new SubscriptionRepository(subscriptionModel);

  service = new PusherService(repository, client);

  return service;
}

export default async function handler(
  req: NowRequest,
  res: NowResponse,
): Promise<NowResponse> {
  const handler = await setupDependency();

  try {
    await handler.pushMessages(req.body.data);

    return res.status(204);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(err);
    }

    return res.status(500).json({
      data: null,
      error: err.message,
    });
  }
}
