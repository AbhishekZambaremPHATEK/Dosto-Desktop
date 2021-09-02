/* global
  Backbone,
  Whisper,
  MessageController
*/

/* eslint-disable more/no-then */

// eslint-disable-next-line func-names
(function() {
  'use strict';

  window.Whisper = window.Whisper || {};
  Whisper.DeleteSyncs = new (Backbone.Collection.extend({
    forMessage(message) {
      const senderId = window.ConversationController.ensureContactIds({
        e164: message.get('source'),
        uuid: message.get('sourceUuid'),
      });
      const receipt = this.findWhere({
        senderId,
        timestamp: message.get('sent_at'),
      });
      if (receipt) {
        window.log.info('Found early delete sync for message');
        this.remove(receipt);
        return receipt;
      }

      return null;
    },
    async onDeleteForMeSync(receipt) {
      try {
        const messages = await window.Signal.Data.getMessagesBySentAt(
          receipt.get('timestamp'),
          {
            MessageCollection: Whisper.MessageCollection,
          }
        );
        window.log.info(
          'No message for delete sync 12345',
          messages
        );

        const found = messages.models.find(item => {
          const senderId = receipt.get('groupId') ? receipt.get('groupId') : item.get('conversationId')
          const receiptsenderId = receipt.get('groupId') ? receipt.get('groupId') : receipt.get('senderId')
          window.log.info(
            'No message for delete sync cheking senderID',
            item,
            receiptsenderId
          );
          return senderId === receiptsenderId;
        });

        window.log.info(
          'No message for delete sync cheking senderID',
          found
        );
        // const found = messages.models[0];

        const notificationForMessage = found
          ? Whisper.Notifications.findWhere({ messageId: found.id })
          : null;
        Whisper.Notifications.remove(notificationForMessage);

        if (!found) {
          window.log.info(
            'No message for delete sync',
            receipt.get('senderId'),
            receipt.get('senderE164'),
            receipt.get('senderUuid'),
            receipt.get('timestamp')
          );
          return;
        }

        const message = MessageController.register(found.id, found);

        // If message is unread, we mark it read. Otherwise, we update the expiration
        //   timer to the time specified by the read sync if it's earlier than
        //   the previous read time.
  

          // onReadMessage may result in messages older than this one being
          //   marked read. We want those messages to have the same expire timer
          //   start time as this one, so we pass the readAt value through.
          const conversation = message.getConversation();
          if (conversation) {
            conversation.onDeleteForMeMessage(message);
          }


        await window.Signal.Data.saveMessage(message.attributes, {
          Message: Whisper.Message,
        });

        this.remove(receipt);
      } catch (error) {
        window.log.error(
          'deleteSyncs.onReceipt error:',
          error && error.stack ? error.stack : error
        );
      }
    },
  }))();
})();
