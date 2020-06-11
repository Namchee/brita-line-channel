import { Message, QuickReplyItem, FlexBubble } from '@line/bot-sdk';
import {
  BotService,
  BotServiceParameters,
  BotServiceResult,
  HandlerParameters,
} from './base';
import { REPLY } from './../reply';
import { StringMap } from '../types';
import {
  generateQuickReplyObject,
  generateBubbleContainer,
  generateTextComponent,
  generateCarouselContainer,
  generateFlexMessage,
} from '../utils/lineFormatter';
import { Announcement } from './../entity/announcement';
import { CategoryRepository } from '../repository/category';
import { AnnouncementRepository } from '../repository/announcement';

export class AnnouncementService extends BotService {
  private static readonly PROMPT_MESSAGE: Message = {
    type: 'text',
    quickReply: {
      items: [
        generateQuickReplyObject(
          REPLY.NEXT_ANNOUNCEMENT_LABEL,
          REPLY.NEXT_ANNOUNCEMENT_TEXT,
        ),
        generateQuickReplyObject(
          REPLY.RECHOOSE_CATEGORY_LABEL,
          REPLY.RECHOOSE_CATEGORY_TEXT,
        ),
        generateQuickReplyObject(
          REPLY.END_ANNOUNCEMENT_LABEL,
          REPLY.END_ANNOUNCEMENT_TEXT,
        ),
      ],
    },
    text: REPLY.PROMPT_ANNOUNCEMENT,
  };

  private static readonly INTRO_MESSAGE: Message = {
    type: 'text',
    text: REPLY.SHOW_ANNOUNCEMENT,
  };

  public constructor(
    private readonly announcementRepository: AnnouncementRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {
    super('pengumuman');

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

  private handleFirstState = async (
    {
      misc,
    }: HandlerParameters,
  ): Promise<BotServiceResult> => {
    if (misc) {
      misc = undefined;
    }

    const categories = await this.categoryRepository.findAll();

    // Fallback case
    if (categories.length === 0) {
      return {
        state: 0,
        message: [{
          type: 'text',
          text: REPLY.NO_ANNOUNCEMENT,
        }],
        misc,
      };
    }

    const quickReplies: QuickReplyItem[] = categories.map((category) => {
      return generateQuickReplyObject(category.name, category.name);
    });

    quickReplies.push(
      generateQuickReplyObject(REPLY.END_REQUEST_LABEL, REPLY.END_REQUEST_TEXT),
    );

    let messageText = REPLY.INPUT_CATEGORY + '\n\n';

    for (let i = 0; i < categories.length; i++) {
      if (i) {
        messageText += '\n';
      }

      messageText += `- ${categories[i].name}`;
    }

    return {
      state: 1,
      message: [{
        type: 'text',
        text: messageText,
        quickReply: {
          items: quickReplies,
        },
      }],
      misc,
    };
  }

  private handleSecondState = async (
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
      try {
        const announcements = await this.announcementRepository.findByCategory(
          text,
          new Date(timestamp),
          {
            limit: 10,
            start: 0,
          },
        );

        const message = this.generateMessage(announcements);

        const messageArray = [message, AnnouncementService.PROMPT_MESSAGE];

        if (message.type === 'flex') {
          messageArray.unshift(AnnouncementService.INTRO_MESSAGE);
        }

        const cache: StringMap = {
          'category': text,
          'page': 2,
        };

        return {
          state: 1,
          message: messageArray,
          misc: cache,
        };
      } catch (err) {
        if (err.message === REPLY.UNKNOWN_CATEGORY) {
          const textMsg: Message = {
            type: 'text',
            text: REPLY.UNKNOWN_CATEGORY,
          };

          const msg = await this.handleFirstState({
            id,
            text: '',
            timestamp,
            misc,
          });

          msg.message.unshift(textMsg);

          return msg;
        }

        throw err;
      }
    } else {
      switch (text) {
        case REPLY.NEXT_ANNOUNCEMENT_TEXT.toLowerCase(): {
          const categoryName = misc.category;
          const announcements = await this.announcementRepository
            .findByCategory(
              categoryName,
              new Date(timestamp),
              {
                limit: 10,
                start: (misc.page - 1) * 10,
              },
            );

          const message = this.generateMessage(announcements);

          const messageArray = [message, AnnouncementService.PROMPT_MESSAGE];

          let page = misc.page;

          if (message.type === 'flex') {
            messageArray.unshift(AnnouncementService.INTRO_MESSAGE);
            page++;
          }

          return {
            state: 1,
            message: messageArray,
            misc: {
              'category': misc.category,
              'page': page,
            },
          };
        }
        case REPLY.END_ANNOUNCEMENT_TEXT.toLowerCase(): {
          return {
            state: 0,
            message: [{
              type: 'text',
              text: REPLY.END_REQUEST_REPLY,
            }],
            misc: {},
          };
        }
        case REPLY.RECHOOSE_CATEGORY_TEXT.toLowerCase(): {
          misc = undefined;
          return this.handleFirstState({ id, text: '', timestamp, misc });
        }
        default: {
          return {
            state: 1,
            message: [
              {
                type: 'text',
                text: REPLY.UNIDENTIFIABLE,
              },
              AnnouncementService.PROMPT_MESSAGE,
            ],
            misc,
          };
        }
      }
    }
  }

  private generateMessage = (
    announcements: Announcement[],
  ): Message => {
    if (announcements.length === 0) {
      return {
        type: 'text',
        text: REPLY.NO_ANNOUNCEMENT,
      };
    }

    const bubbles: FlexBubble[] = announcements.map(
      (announcement: Announcement) => {
        const header = generateTextComponent(
          announcement.title,
          'lg',
          true,
          true,
        );

        const body = generateTextComponent(announcement.contents);

        return generateBubbleContainer([body], header, true, true);
      });

    const carouselContainer = generateCarouselContainer(bubbles);

    return generateFlexMessage(carouselContainer);
  }
}
