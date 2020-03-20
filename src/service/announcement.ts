import { Message, QuickReplyItem, FlexBubble } from '@line/bot-sdk';
import {
  BotService,
  BotServiceParameters,
  BotServiceResult,
  HandlerParameters,
} from './base';
import { findAll as findAllCategory } from './../repository/category';
import {
  findByCategory as findAnnouncementByCategory,
} from './../repository/announcement';
import { REPLY } from './../reply';
import { StringMap, UserError } from './../utils';
import {
  generateQuickReplyObject,
  generateBubbleContainer,
  generateTextComponent,
  generateCarouselContainer,
  generateFlexMessage,
} from './../formatter';
import { Announcement } from './../entity/announcement';

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
          REPLY.END_REQUEST_LABEL,
          REPLY.END_REQUEST_TEXT,
        ),
      ],
    },
    text: REPLY.PROMPT_ANNOUNCEMENT,
  };

  private static readonly INTRO_MESSAGE: Message = {
    type: 'text',
    text: REPLY.SHOW_ANNOUNCEMENT,
  };

  public constructor() {
    super('pengumuman');

    this.handler = [
      this.handleFirstState,
      this.handleSecondState,
    ];
  }
  public handle = async (
    {
      state,
      text,
      timestamp,
      misc,
    }: BotServiceParameters,
  ): Promise<BotServiceResult> => {
    return await this.handler[state]({ text, timestamp, misc });
  }

  private handleFirstState = async (
    {
      misc,
    }: HandlerParameters,
  ): Promise<BotServiceResult> => {
    if (misc) {
      misc = undefined;
    }

    const categories = await findAllCategory();

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

    let messageText = REPLY.INPUT_CATEGORY + '\n';

    for (let i = 0; i < categories.length; i++) {
      if (i) {
        messageText += '\n';
      }

      messageText += categories[i].name;
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
      text,
      timestamp,
      misc,
    }: HandlerParameters,
  ): Promise<BotServiceResult> => {
    if (!misc || text === REPLY.NEXT_ANNOUNCEMENT_TEXT.toLowerCase()) {
      try {
        const announcements = await findAnnouncementByCategory(
          misc?.category || text,
          new Date(timestamp),
          {
            limit: 10,
            start: misc ? (misc.page - 1) * 10 : 0,
          },
        );

        const message = await this.generateAnnouncementCarousel(
          announcements,
        );

        const messageArray = [message, AnnouncementService.PROMPT_MESSAGE];

        if (message.type === 'flex') {
          messageArray.unshift(AnnouncementService.INTRO_MESSAGE);
        }

        const page = misc?.page || 1;

        const cache: StringMap = {
          'category': misc?.category || text,
          'page': message.type === 'text' ? page : page + 1, // next page
        };

        return {
          state: 1,
          message: messageArray,
          misc: message.type === 'flex' ? cache : undefined,
        };
      } catch (err) {
        if (err instanceof UserError) {
          const result = await this.handleFirstState({ text, timestamp });

          result.message.unshift({
            type: 'text',
            text: REPLY.UNKNOWN_CATEGORY,
          });

          return result;
        }

        throw err;
      }
    } else {
      switch (text) {
        case REPLY.END_REQUEST_TEXT.toLowerCase(): {
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
          return this.handleFirstState({ text: '', timestamp, misc });
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

  private generateAnnouncementCarousel = async (
    announcements: Announcement[],
  ): Promise<Message> => {
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
