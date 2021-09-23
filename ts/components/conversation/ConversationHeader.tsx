import React from 'react';
import classNames from 'classnames';
import {
  ContextMenu,
  ContextMenuTrigger,
  MenuItem,
  SubMenu,
} from 'react-contextmenu';

import { Emojify } from './Emojify';
import { Avatar } from '../Avatar';
import { InContactsIcon } from '../InContactsIcon';

import { LocalizerType } from '../../types/Util';
import { ColorType } from '../../types/Colors';
import { ConfirmationModal } from '../ConfirmationModal';
import { WebAPIType } from '../../textsecure/WebAPI';
import lastSeenAgo from "last-seen-ago";

interface TimerOption {
  name: string;
  value: number;
}

export interface PropsDataType {
  id: string;
  name?: string;

  phoneNumber?: string;
  profileName?: string;
  color?: ColorType;
  avatarPath?: string;
  type: 'direct' | 'group';
  title: string;

  isAccepted?: boolean;
  isVerified?: boolean;
  isMe?: boolean;
  isArchived?: boolean;
  leftGroup?: boolean;

  expirationSettingName?: string;
  showBackButton?: boolean;
  timerOptions?: Array<TimerOption>;
}

export interface PropsActionsType {
  onSetDisappearingMessages: (seconds: number) => void;
  onDeleteMessages: () => void;
  onResetSession: () => void;
  onSearchInConversation: () => void;
  onOutgoingAudioCallInConversation: () => void;
  onOutgoingVideoCallInConversation: () => void;

  onShowSafetyNumber: () => void;
  onShowAllMedia: () => void;
  onShowGroupMembers: () => void;
  //onRemoveGroupMembers: () => void;
  onGoBack: () => void;

  onArchive: () => void;
  onMoveToInbox: () => void;
  onLeave: () => void;
}

export interface PropsHousekeepingType {
  i18n: LocalizerType;
}

export type PropsType = PropsDataType &
  PropsActionsType &
  PropsHousekeepingType;

export class ConversationHeader extends React.Component<PropsType> {
  public showMenuBound: (event: React.MouseEvent<HTMLButtonElement>) => void;
  public menuTriggerRef: React.RefObject<any>;
  state = {
    confirmingLeave: false,
    online:false,
    lastseen:0,
    hidden:false
  };
  server: WebAPIType;
  myVar:any;
  public constructor(props: PropsType) {
    super(props);
    const OLD_USERNAME = window.storage.get('number_id');
    const USERNAME = window.storage.get('uuid_id');
    const PASSWORD = window.storage.get('password');
    this.server = window.WebAPI.connect({ username:USERNAME||OLD_USERNAME, password:PASSWORD });
    this.menuTriggerRef = React.createRef();
    this.showMenuBound = this.showMenu.bind(this);
  }

public getStatus(){
  if(this.props.phoneNumber) this.server.getStatus(this.props.phoneNumber.replace(/\s/g, "").replace('0','+91')).then(res => {
    res=JSON.parse(res)
    // window.log.info("my online status response",res)
    if(res.responsecode=="200") if(res.responsemessage=="success"){
      // window.log.info("my online status response 1",res)
      this.setState({
        online: res.responselist.online,
        lastseen:res.responselist.lastseen,
        hidden:res.responselist.hidden
      });
    }
  })
}
    public componentWillUnmount()
    {
      clearInterval(this.myVar)
    }

  public componentDidMount() {
    this.server.getStatus(window.textsecure.storage.user.getNumber()).then(res => {
      res=JSON.parse(res)
      if(res.responsecode=="200" && res.responsemessage=="success" && res.responselist.hidden==false){
        // window.log.info("my online status response 1",res)
        this.getStatus();
        this.myVar = setInterval(()=>{
          this.getStatus();
        }, 5000);
      }
    })
  }

  public showMenu(event: React.MouseEvent<HTMLButtonElement>) {
    if (this.menuTriggerRef.current) {
      this.menuTriggerRef.current.handleContextClick(event);
    }
  }

  public renderBackButton() {
    const { onGoBack, showBackButton } = this.props;

    return (
      <button
        onClick={onGoBack}
        className={classNames(
          'module-conversation-header__back-icon',
          showBackButton ? 'module-conversation-header__back-icon--show' : null
        )}
        disabled={!showBackButton}
      />
    );
  }

  public renderTitle() {
    const {
      name,
      phoneNumber,
      title,
      type,
      i18n,
      isMe,
      profileName,
      isVerified,
    } = this.props;

    if (isMe) {
      return (
        <div className="module-conversation-header__title">
          {i18n('noteToSelf')}
        </div>
      );
    }

    const shouldShowIcon = Boolean(name && type === 'direct');
    const shouldShowNumber = Boolean(phoneNumber && (name || profileName));

    return (
      <div className="module-conversation-header__title">
        <Emojify text={title} />
        {shouldShowIcon ? (
          <span>
            {' '}
            <InContactsIcon i18n={i18n} />
          </span>
        ) : null}
        {shouldShowNumber ? ` · ${phoneNumber}` : null}
        {isVerified ? (
          <span>
            {' · '}
            <span className="module-conversation-header__title__verified-icon" />
            {i18n('verified')}
          </span>
        ) : null}
      </div>
    );
  }

  public renderAvatar() {
    const {
      avatarPath,
      color,
      i18n,
      type,
      isMe,
      name,
      phoneNumber,
      profileName,
      title,
    } = this.props;

    return (
      <span className="module-conversation-header__avatar">
        <Avatar
          avatarPath={avatarPath}
          color={color}
          conversationType={type}
          i18n={i18n}
          noteToSelf={isMe}
          title={title}
          name={name}
          phoneNumber={phoneNumber}
          profileName={profileName}
          size={28}
        />
      </span>
    );
  }

  public renderExpirationLength() {
    const { expirationSettingName, showBackButton } = this.props;

    if (!expirationSettingName) {
      return null;
    }

    return (
      <div
        className={classNames(
          'module-conversation-header__expiration',
          showBackButton
            ? 'module-conversation-header__expiration--hidden'
            : null
        )}
      >
        <div className="module-conversation-header__expiration__clock-icon" />
        <div className="module-conversation-header__expiration__setting">
          {expirationSettingName}
        </div>
      </div>
    );
  }

  public renderMoreButton(triggerId: string) {
    const { showBackButton } = this.props;

    return (
      <ContextMenuTrigger id={triggerId} ref={this.menuTriggerRef}>
        <button
          onClick={this.showMenuBound}
          className={classNames(
            'module-conversation-header__more-button',
            showBackButton
              ? null
              : 'module-conversation-header__more-button--show'
          )}
          disabled={showBackButton}
        />
      </ContextMenuTrigger>
    );
  }

  public renderSearchButton() {
    const { onSearchInConversation, showBackButton } = this.props;

    return (
      <button
        onClick={onSearchInConversation}
        className={classNames(
          'module-conversation-header__search-button',
          showBackButton
            ? null
            : 'module-conversation-header__search-button--show'
        )}
        disabled={showBackButton}
      />
    );
  }

  public renderOutgoingAudioCallButton() {
    if (!window.CALLING) {
      return null;
    }
    if (this.props.type === 'group' || this.props.isMe) {
      return null;
    }

    const { onOutgoingAudioCallInConversation, showBackButton } = this.props;

    return (
      <button
        onClick={onOutgoingAudioCallInConversation}
        className={classNames(
          'module-conversation-header__audio-calling-button',
          showBackButton
            ? null
            : 'module-conversation-header__audio-calling-button--show'
        )}
        disabled={showBackButton}
      />
    );
  }

  public renderOutgoingVideoCallButton() {
    if (!window.CALLING) {
      return null;
    }
    if (this.props.type === 'group' || this.props.isMe) {
      return null;
    }

    const { onOutgoingVideoCallInConversation, showBackButton } = this.props;

    return (
      <button
        onClick={onOutgoingVideoCallInConversation}
        className={classNames(
          'module-conversation-header__video-calling-button',
          showBackButton
            ? null
            : 'module-conversation-header__video-calling-button--show'
        )}
        disabled={showBackButton}
      />
    );
  }

  public renderMenu(triggerId: string) {
    const {
      i18n,
      isAccepted,
      isMe,
      type,
      isArchived,
      leftGroup,
      onDeleteMessages,
      // onResetSession,
      onSetDisappearingMessages,
      onShowAllMedia,
      onShowGroupMembers,
      //onRemoveGroupMembers,
      onShowSafetyNumber,
      onArchive,
      onMoveToInbox,
      timerOptions,
    } = this.props;

    const disappearingTitle = i18n('disappearingMessages') as any;
    const isGroup = type === 'group';

    return (
      <ContextMenu id={triggerId}>
        {!leftGroup && isAccepted ? (
          <SubMenu title={disappearingTitle}>
            {(timerOptions || []).map(item => (
              <MenuItem
                key={item.value}
                onClick={() => {
                  onSetDisappearingMessages(item.value);
                }}
              >
                {item.name}
              </MenuItem>
            ))}
          </SubMenu>
        ) : null}
        <MenuItem onClick={onShowAllMedia}>{i18n('viewRecentMedia')}</MenuItem>
        {isGroup && !leftGroup ? (
          <MenuItem onClick={onShowGroupMembers}>
            {i18n('showMembers')}
          </MenuItem>
        ) : null}
        {/* {isGroup && !leftGroup ? (
          <MenuItem      
          onClick={() => this.setState({
            confirmingLeave: true
          })}>
            {i18n('leaveGroup')}
          </MenuItem>
        ) : null} */}
        {!isGroup && !isMe ? (
          <MenuItem onClick={onShowSafetyNumber}>
            {i18n('showSafetyNumber')}
          </MenuItem>
        ) : null}
        {/* {!isGroup && isAccepted ? (
          <MenuItem onClick={onResetSession}>{i18n('resetSession')}</MenuItem>
        ) : null} */}
        {isArchived ? (
          <MenuItem onClick={onMoveToInbox}>
            {i18n('moveConversationToInbox')}
          </MenuItem>
        ) : (
          <MenuItem onClick={onArchive}>{i18n('archiveConversation')}</MenuItem>
        )}
        <MenuItem onClick={onDeleteMessages}>{i18n('deleteMessages')}</MenuItem>
      </ContextMenu>
    );
  }

  public formatAMPM(date:any) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  public render() {
    const { id } = this.props;
    const triggerId = `conversation-${id}`;
    const {
      i18n,
      onLeave
    } = this.props;

    return (
      <div className="module-conversation-header">
        {this.renderBackButton()}
        <div className="module-conversation-header__title-container">
          <div className="module-conversation-header__title-flex">
          {this.renderAvatar()}
            <ul style={{listStyleType: 'none',padding:'0px',margin:'0px'}}>
            <li>
            <div className="module-conversation-header__title-flex">
           
            {this.renderTitle()}
          </div>
            </li>
            <li>
            {!this.state.hidden ? 
                this.state.online ? <>&nbsp;&nbsp;Online</>:
                this.state.lastseen!=0 ? 
                  lastSeenAgo.getLastSeen(this.state.lastseen/1000).search("month")==-1 && lastSeenAgo.getLastSeen(this.state.lastseen/1000).search("year")==-1? <>&nbsp;&nbsp;Last seen {lastSeenAgo.getLastSeen(this.state.lastseen/1000)}</> : 
                  <>&nbsp;&nbsp;Last seen, {new Date(this.state.lastseen).toDateString()+", "+this.formatAMPM(new Date(this.state.lastseen))}</>:
                '':
              ''
            }
            </li>
            </ul>
          </div>
        </div>
        {this.renderExpirationLength()}
        {this.renderSearchButton()}
        {this.renderOutgoingVideoCallButton()}
        {this.renderOutgoingAudioCallButton()}
        {this.renderMoreButton(triggerId)}
        {this.renderMenu(triggerId)}
        {this.state.confirmingLeave && (
        <ConfirmationModal
          actions={[
            {
              text: i18n(
                'ConversationDetailsActions--leave-group-modal-confirm'
              ),
              action: onLeave,
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
        )}
      </div>
    );
  }
}
