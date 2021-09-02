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
  Whisper.ClearChatSync = new (Backbone.Collection.extend({
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
    async onClearChatSync(receipt) {
      try {
   
        const conversationId = receipt.get('groupId') ? receipt.get('groupId') :  ConversationController.ensureContactIds({
          e164: receipt.get('senderE164'),
          uuid: receipt.get('senderUuid'),
          highTrust: true,
        });
        
        window.log.info(
          'No message for clear chat sync cheking senderID',
          receipt.get('senderE164'),
          receipt.get('senderUuid')
        
        );
        const conversation = ConversationController.get(conversationId);
      if (conversation) {
            conversation.onClearChatForMeMessage();
          }

        this.remove(receipt);
      } catch (error) {
        window.log.error(
          'ClearChatSync.onReceipt error:',
          error && error.stack ? error.stack : error
        );
      }
    },
  }))();
})();
