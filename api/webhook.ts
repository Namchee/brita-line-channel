import crypto from 'crypto';
import Redis from 'ioredis';
import { NowRequest, NowResponse } from '@now/node';
import { Client } from '@line/bot-sdk';
import { ServiceHub } from '../src/hub';
import { AnnouncementService } from '../src/service/announcement';
import { StringMap } from '../src/utils';
import { StateRepositoryRedis } from '../src/repository/state';

let serviceHub: ServiceHub;

function setupDependency(): ServiceHub {
  if (serviceHub) {
    return serviceHub;
  }

  const redisClient = new Redis({
    host: process.env.REDIS_URL,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });
  const lineClient = new Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET,
  });

  const stateRepository = new StateRepositoryRedis(redisClient);

  const announcementService = new AnnouncementService();
  const serviceMap: StringMap = {};

  serviceMap[announcementService.identifier] = announcementService;

  serviceHub = new ServiceHub(lineClient, serviceMap, stateRepository);

  return serviceHub;
}

async function verifyLineSignature(
  signature: string,
  requestBody: any,
): Promise<void> {
  const channelSecret = process.env.CHANNEL_SECRET || '';
  const body = JSON.stringify(requestBody);

  const generatedSignature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body).digest('base64');

  if (signature !== generatedSignature) {
    throw new Error('Invalid signature');
  }
}

export default async function handler(
  req: NowRequest,
  res: NowResponse,
): Promise<NowResponse> {
  try {
    await verifyLineSignature(
      req.headers['x-line-signature'] as string,
      req.body,
    );

    const hub = setupDependency();

    const result = await Promise.all(
      req.body.events.map(hub.handleBotQuery),
    );

    return res.status(200)
      .json(result);
  } catch (err) {
    return res.status(500)
      .json(err.message);
  }
}
