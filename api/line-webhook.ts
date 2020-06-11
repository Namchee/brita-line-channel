import crypto from 'crypto';
import Redis from 'ioredis';
import { NowRequest, NowResponse } from '@now/node';
import { Client } from '@line/bot-sdk';
import { ServiceHub } from '../src/hub';
import { AnnouncementService } from '../src/service/announcement';
import { StringMap } from '../src/types';
import { StateRepositoryRedis } from '../src/repository/state';
import { AnnouncementRepository } from '../src/repository/announcement';
import { CategoryRepository } from '../src/repository/category';
import { LOGIC_ERROR } from '../src/reply';

let serviceHub: ServiceHub;

function setupDependency(): ServiceHub {
  if (serviceHub) {
    return serviceHub;
  }

  if (!process.env.API_URL || !process.env.API_TOKEN) {
    throw new Error(LOGIC_ERROR.ENV_NOT_SET);
  }

  const redisClient = new Redis(
    Number(process.env.REDIS_PORT),
    process.env.REDIS_URL,
    {
      password: process.env.REDIS_PASSWORD,
    },
  );

  const lineClient = new Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET,
  });

  const announcementRepository = new AnnouncementRepository(
    process.env.API_URL,
    process.env.API_TOKEN,
  );
  const categoryRepository = new CategoryRepository(
    process.env.API_URL,
    process.env.API_TOKEN,
  );

  const stateRepository = new StateRepositoryRedis(redisClient);

  const announcementService = new AnnouncementService(
    announcementRepository,
    categoryRepository,
  );
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
    if (process.env.NODE_ENV !== 'production') {
      console.error(err);
    }

    return res.status(500)
      .json(err.message);
  }
}
