/* global Whisper: false */
/* global textsecure: false */

// eslint-disable-next-line func-names
(function() {
  'use strict';

  window.Whisper = window.Whisper || {};

  Whisper.ContactListView = Whisper.ListView.extend({
    tagName: 'div',
    itemView: Whisper.View.extend({
      tagName: 'div',
      className: 'contact',
      templateName: 'contact',
      initialize(options) {
        this.ourNumber = textsecure.storage.user.getNumber();
        this.listenBack = options.listenBack;
        this.loading = false;
        window.log.info("model while removing 3",options)
        this.groupModel=options.groupModel;
        this.listenTo(this.model, 'change', this.render);
      },
      render() {
        if (this.contactView) {
          this.contactView.remove();
          this.contactView = null;
        }

        this.contactView = new Whisper.ReactWrapperView({
          className: 'contact-wrapper',
          Component: window.Signal.Components.ContactListItem,
          props: {
            ...this.model.cachedProps,
            onLeave:this.leaveGroup.bind(this),
            onClick: this.showIdentity.bind(this),
            removeMember: this.removeMember.bind(this),
          },
        });
        this.$el.append(this.contactView.el);
        return this;
      },
      async leaveGroup(){
        window.log.info('member deleted log',this.model);
        try {
          await this.model.leaveGroup();
        } catch (error) {
          window.log.error(
            'Error while remove member',
            error
          );
        }
      },
      removeMember(){
        window.log.info('member deleted log',this.model);
        const dialog = new Whisper.ConfirmationDialogView({
          confirmStyle: 'negative',
          message: window.i18n('removeMemberWarning'),
          okText: window.i18n('remove'),
          resolve: async () => {
            try {
              await this.model.removeMember(this.groupModel);
            } catch (error) {
              window.log.error(
                'Error while remove member',
                error
              );
              // this.showToast(Whisper.DeleteForEveryoneFailedToast);
            }
            // this.resetPanel();
          },
        });
  
        this.$el.prepend(dialog.el);
        dialog.focusCancel();
      },
      showIdentity() {
        if (this.model.isMe() || this.loading) {
          return;
        }

        this.loading = true;
        this.render();

        this.panelView = new Whisper.KeyVerificationPanelView({
          model: this.model,
          onLoad: view => {
            this.loading = false;
            this.listenBack(view);
            this.render();
          },
        });
      },
    }),
  });
})();
