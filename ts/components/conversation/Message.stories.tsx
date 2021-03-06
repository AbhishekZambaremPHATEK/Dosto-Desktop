import * as React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

// @ts-ignore
import { setup as setupI18n } from '../../../js/modules/i18n';
// @ts-ignore
import enMessages from '../../../_locales/en/messages.json';

import {
  Message,
  Props as AllProps,
  PropsActions,
  PropsData,
  PropsHousekeeping,
} from './Message';
import { EmojiPicker } from '../emoji/EmojiPicker';
import { MIMEType } from '../../types/MIME';

const book = storiesOf('Components/Conversation/Message', module);

const baseDataProps: Pick<
  PropsData,
  | 'id'
  | 'canReply'
  | 'conversationId'
  | 'interactionMode'
  | 'conversationType'
  | 'previews'
  | 'timestamp'
  | 'authorTitle'
> = {
  id: 'asdf',
  canReply: true,
  conversationId: 'asdf',
  interactionMode: 'mouse',
  conversationType: 'direct',
  previews: [],
  timestamp: Date.now(),
  authorTitle: '(202) 555-2001',
};

type MessageStory = [
  string,
  Array<{
    makeDataProps: () => PropsData;
    makeActionProps?: () => PropsActions;
    makeHouseKeepingProps?: () => PropsHousekeeping;
    title?: string;
  }>
];

const makeDefaultActionProps = (): PropsActions => ({
  clearSelectedMessage: action('clearSelectedMessage'),
  reactToMessage: action('reactToMessage'),
  replyToMessage: action('replyToMessage'),
  retrySend: action('retrySend'),
  deleteMessage: action('deleteMessage'),
  deleteMessageForEveryone: action('deleteMessageForEveryone'),
  showMessageDetail: action('showMessageDetail'),
  openConversation: action('openConversation'),
  showContactDetail: action('showContactDetail'),
  showVisualAttachment: action('showVisualAttachment'),
  downloadAttachment: action('downloadAttachment'),
  displayTapToViewMessage: action('displayTapToViewMessage'),
  openLink: action('openLink'),
  scrollToQuotedMessage: action('scrollToQuotedMessage'),
  selectMessage: action('selectMessage'),
  showExpiredIncomingTapToViewToast: action(
    'showExpiredIncomingTapToViewToast'
  ),
  showExpiredOutgoingTapToViewToast: action(
    'showExpiredOutgoingTapToViewToast'
  ),
});

const makeDefaultHousekeepingProps = (): PropsHousekeeping => ({
  i18n: setupI18n('en', enMessages),
});

const stories: Array<MessageStory> = [
  [
    'Plain Message',
    [
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          authorColor: 'green',
          text: '????',
          canDeleteForEveryone: true,
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          authorColor: 'green',
          text: 'Hello there from the new world! http://somewhere.com',
          canDeleteForEveryone: true,
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          authorColor: 'red',
          text: 'Hello there from the new world!',
          canDeleteForEveryone: true,
        }),
        makeHouseKeepingProps: () => ({
          ...makeDefaultHousekeepingProps(),
          collapseMetadata: true,
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          authorColor: 'grey',
          canDeleteForEveryone: true,
          text:
            'Hello there from the new world! And this is multiple lines of text. Lines and lines and lines.',
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          canDeleteForEveryone: true,
          authorColor: 'deep_orange',
          text:
            'Hello there from the new world! And this is multiple lines of text. Lines and lines and lines.',
        }),
        makeHouseKeepingProps: () => ({
          ...makeDefaultHousekeepingProps(),
          collapseMetadata: true,
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'outgoing',
          canDeleteForEveryone: true,
          status: 'sent',
          authorColor: 'pink',
          text: '????',
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'outgoing',
          canDeleteForEveryone: true,
          status: 'read',
          authorColor: 'pink',
          text: 'Hello there from the new world! http://somewhere.com',
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'outgoing',
          status: 'sent',
          canDeleteForEveryone: true,
          text: 'Hello there from the new world! ????',
        }),
        makeHouseKeepingProps: () => ({
          ...makeDefaultHousekeepingProps(),
          collapseMetadata: true,
        }),
      },
      {
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'outgoing',
          status: 'sent',
          canDeleteForEveryone: true,
          authorColor: 'blue',
          text:
            'Hello there from the new world! And this is multiple lines of text. Lines and lines and lines.',
        }),
        makeHouseKeepingProps: () => ({
          ...makeDefaultHousekeepingProps(),
          collapseMetadata: true,
        }),
      },
    ],
  ],
  [
    'Reactions',
    [
      ...([
        {
          title: 'Single Reaction (not me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Jack Sparrow',
              },
            },
          ],
        },
        {
          title: 'Two Reactions (neither me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Jack Sparrow',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                profileName: 'Davy Jones',
              },
            },
          ],
        },
        {
          title: 'Three Reactions (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Jack Sparrow',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                profileName: 'Joel Ferrari',
              },
            },
          ],
        },
        {
          title: 'Six Reactions (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Jack Sparrow',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Four Reactions, Three Same (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Seven Reactions, Three Same, One Different (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Three Reations, All Same (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Six Reactions, Two Kinds (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Nine Reactions, Three Kinds (none me)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Short Message, Seven Reactions (none me)',
          short: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Short Message, Six Reactions (none me)',
          short: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Short Message, No Reactions',
          short: true,
          reactions: [],
        },
        {
          title: 'Nine Reactions (me in second group)',
          reactions: [
            {
              emoji: '????',
              from: {
                isMe: true,
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Nine Reactions (me in first group)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                isMe: true,
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Nine Reactions (me in third group)',
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                isMe: true,
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Outgoing Message, One Reaction (not me)',
          outgoing: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Outgoing Message, Nine Reactions (none me)',
          outgoing: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Outgoing Message, Nine Reactions (me in first group)',
          outgoing: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                isMe: true,
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Outgoing Short Message, Nine Reactions (none me)',
          outgoing: true,
          short: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552677',
                phoneNumber: '+14155552677',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552678',
                phoneNumber: '+14155552678',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '??????',
              from: {
                id: '+14155552679',
                phoneNumber: '+14155552679',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Outgoing Short Message, Six Reactions, Two Groups (none me)',
          outgoing: true,
          short: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552674',
                phoneNumber: '+14155552674',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552675',
                phoneNumber: '+14155552675',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552676',
                phoneNumber: '+14155552676',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
        {
          title: 'Outgoing Short Message, Three Reactions, All Same (none me)',
          outgoing: true,
          short: true,
          reactions: [
            {
              emoji: '????',
              from: {
                id: '+14155552671',
                phoneNumber: '+14155552671',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552672',
                phoneNumber: '+14155552672',
                name: 'Amelia Briggs',
              },
            },
            {
              emoji: '????',
              from: {
                id: '+14155552673',
                phoneNumber: '+14155552673',
                name: 'Amelia Briggs',
              },
            },
          ],
        },
      ] as Array<{
        outgoing: boolean;
        short: boolean;
        reactions: PropsData['reactions'];
        title?: string;
      }>).map(spec => ({
        title: spec.title,
        makeDataProps: () => ({
          ...baseDataProps,
          canDeleteForEveryone: true,
          // tsc disagrees with tslint, I favor safety (tsc)
          // tslint:disable-next-line no-unnecessary-type-assertion
          direction: (spec.outgoing
            ? 'outgoing'
            : 'incoming') as PropsData['direction'],
          text: spec.short
            ? 'hahaha'
            : "I'd like to order one large phone with extra phones please. cell phone, no no no rotary... and payphone on half.",
          reactions: spec.reactions
            ? spec.reactions.map((re, i) => ({
                ...re,
                timestamp: i,
              }))
            : [],
        }),
      })),
    ],
  ],
  [
    'BlurHash',
    [
      {
        title: 'Incoming BlurHash',
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          canDeleteForEveryone: true,
          attachments: [
            {
              blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
              width: 300,
              height: 600,
              fileName: 'foo.jpg',
              contentType: 'image/jpeg' as MIMEType,
              url: '',
            },
          ],
        }),
      },
    ],
  ],
  [
    'Sticker',
    [
      {
        title: 'Outgoing Sticker',
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'outgoing',
          status: 'sent',
          authorColor: 'green',
          canDeleteForEveryone: true,
          isSticker: true,
          attachments: [
            {
              url: '/fixtures/512x515-thumbs-up-lincoln.webp',
              fileName: '512x515-thumbs-up-lincoln.webp',
              contentType: 'image/webp' as MIMEType,
              width: 128,
              height: 128,
            },
          ],
        }),
      },
      {
        title: 'Incoming Sticker',
        makeDataProps: () => ({
          ...baseDataProps,
          direction: 'incoming',
          authorColor: 'green',
          canDeleteForEveryone: true,
          isSticker: true,
          attachments: [
            {
              url: '/fixtures/512x515-thumbs-up-lincoln.webp',
              fileName: '512x515-thumbs-up-lincoln.webp',
              contentType: 'image/webp' as MIMEType,
              width: 128,
              height: 128,
            },
          ],
        }),
      },
    ],
  ],
];

const renderEmojiPicker: AllProps['renderEmojiPicker'] = ({
  onClose,
  onPickEmoji,
  ref,
}) => (
  <EmojiPicker
    i18n={setupI18n('en', enMessages)}
    skinTone={0}
    onSetSkinTone={action('EmojiPicker::onSetSkinTone')}
    ref={ref}
    onClose={onClose}
    onPickEmoji={onPickEmoji}
  />
);

stories.forEach(([chapterTitle, propsArr]) =>
  book.add(chapterTitle, () =>
    propsArr.map(
      (
        {
          title,
          makeDataProps,
          makeActionProps = makeDefaultActionProps,
          makeHouseKeepingProps = makeDefaultHousekeepingProps,
        },
        i
      ) => {
        const dataProps = makeDataProps();
        const outgoing = dataProps.direction === 'outgoing';

        return (
          <>
            {title ? (
              <h3 style={{ textAlign: outgoing ? 'right' : 'left' }}>
                {title}
              </h3>
            ) : null}
            <div key={i} className="module-message-container">
              <Message
                {...dataProps}
                {...makeActionProps()}
                {...makeHouseKeepingProps()}
                renderEmojiPicker={renderEmojiPicker}
              />
            </div>
          </>
        );
      }
    )
  )
);
