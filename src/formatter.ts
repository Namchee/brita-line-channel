import {
  FlexMessage,
  FlexButton,
  FlexText,
  FlexBubble,
  FlexComponent,
  FlexCarousel,
  FlexContainer,
  QuickReplyItem,
} from '@line/bot-sdk';

export function generateQuickReplyObject(
  label: string,
  text: string,
): QuickReplyItem {
  return {
    type: 'action',
    action: {
      type: 'message',
      label,
      text,
    },
  };
}

export function generateTextComponent(
  text: string,
  size?: 'sm' | 'md' | 'lg',
  bold?: boolean,
  center?: boolean,
): FlexText {
  return {
    type: 'text',
    text,
    size: size || 'sm',
    wrap: true,
    weight: bold ? 'bold' : 'regular',
    align: center ? 'center' : 'start',
  };
}

export function generateButtonComponent(
  label: string,
  text: string,
): FlexButton {
  return {
    type: 'button',
    action: {
      type: 'message',
      text,
      label,
    },
    height: 'sm',
  };
}

export function generateBubbleContainer(
  body: FlexComponent[],
  header?: FlexComponent,
  tightPadding?: boolean,
  smallSize?: boolean,
): FlexBubble {
  const bubble: FlexBubble = {
    type: 'bubble',
    size: smallSize ? 'kilo' : 'mega',
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: tightPadding ? 'lg' : undefined,
      contents: body,
    },
  };

  if (header) {
    bubble.header = {
      type: 'box',
      layout: 'vertical',
      paddingAll: tightPadding ? 'lg' : undefined,
      contents: [header],
    };
  }

  return bubble;
}

export function generateCarouselContainer(
  bubbles: FlexBubble[],
): FlexCarousel {
  return {
    type: 'carousel',
    contents: bubbles,
  };
}

export function generateFlexMessage(contents: FlexContainer): FlexMessage {
  return {
    type: 'flex',
    altText: '\0',
    contents,
  };
}
