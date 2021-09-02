import React from 'react';
import classNames from 'classnames';

import { Avatar } from './Avatar';
import { Emojify } from './conversation/Emojify';
import { InContactsIcon } from './InContactsIcon';
// import { ConversationType } from '../state/ducks/conversations';
import { LocalizerType } from '../types/Util';
import { ColorType } from '../types/Colors';
// import { ConfirmationModal } from './ConfirmationModal';
// import { ConfirmationDialog } from './ConfirmationDialog';

interface Props {
  title: string;
  phoneNumber?: string;
  isMe?: boolean;
  name?: string;
  color?: ColorType;
  isVerified?: boolean;
  profileName?: string;
  avatarPath?: string;
  i18n: LocalizerType;
  onClick?: () => void;
  removeMember: () => void;
  // onLeave: () => void;
  // contact?: ConversationType;
}

export class ContactListItem extends React.Component<Props> {

  state = {
    confirmingLeave: false
  };

  public renderAvatar() {
    const {
      avatarPath,
      i18n,
      color,
      name,
      phoneNumber,
      profileName,
      title,
    } = this.props;

    return (
      <Avatar
        avatarPath={avatarPath}
        color={color}
        conversationType="direct"
        i18n={i18n}
        name={name}
        phoneNumber={phoneNumber}
        profileName={profileName}
        title={title}
        size={52}
      />
    );
  }

  public render() {
    const {
      i18n,
      name,
      // onClick,
      // removeMember,
      // onLeave,
      // contact,
      isMe,
      phoneNumber,
      profileName,
      title,
      isVerified,
    } = this.props;


    const displayName = isMe ? i18n('you') : title;
    const shouldShowIcon = Boolean(name);

    const showNumber = Boolean(isMe || name || profileName);
    const showVerified = !isMe && isVerified;

    // if (!contact) {
    //   throw new Error('Contact modal opened without a matching contact');
    // }

    return (
      <div className={classNames(
        'module-contact-list-item',
        // onClick ? 'module-contact-list-item--with-click-handler' : null
      )}>
        <div className="divflex">
            {this.renderAvatar()}
            <div className="module-contact-list-item__text">
              <div className="module-contact-list-item__text__name">
                <Emojify text={displayName} />
                {shouldShowIcon ? (
                  <span>
                    {' '}
                    <InContactsIcon i18n={i18n} />
                  </span>
                ) : null}
              </div>
              <div className="module-contact-list-item__text__additional-data">
                {showVerified ? (
                  <div className="module-contact-list-item__text__verified-icon" />
                ) : null}
                {showVerified ? ` ${i18n('verified')}` : null}
                {showVerified && showNumber ? ' ∙ ' : null}
                {showNumber ? phoneNumber : null}
              </div>
            </div>
        </div>
        {/* <div className="divflex">
            {!isMe ? 
            (<><button
              className="module-unsupported-message__button"
              onClick={onClick}
            >
              Safety Number
            </button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button
              onClick={()=> removeMember()}
              className="module-unsupported-message__button"
            >
              Remove
            </button>
            </>
            ) : ''} 
        </div> */}

        {/* {this.state.confirmingLeave && (
        <ConfirmationModal
          actions={[
            {
              text: i18n(
                'ConversationDetailsActions--leave-group-modal-confirm'
              ),
              action: removeMember,
              style: 'affirmative',
            },
          ]}
          i18n={i18n}
          onClose={() => this.setState({
            confirmingLeave: false
          })}
          title={i18n('ConversationDetailsActions--leave-group-modal-title')}
        >
          {i18n('ConversationDetailsActions--leave-group-modal-content')}
        </ConfirmationModal>
      )} */}

      </div>
    );
  }
}
