import React from 'react';
import classNames from 'classnames';
import { debounce, get } from 'lodash';
import { Manager, Popper, Reference } from 'react-popper';
import { createPortal } from 'react-dom';

import { showSettings } from '../shims/Whisper';
import { Avatar } from './Avatar';
import { AvatarPopup } from './AvatarPopup';
import { LocalizerType } from '../types/Util';
import { ColorType } from '../types/Colors';

export interface PropsType {
  searchTerm: string;
  searchConversationName?: string;
  searchConversationId?: string;
  startSearchCounter: number;

  // To be used as an ID
  ourConversationId: string;
  ourUuid: string;
  ourNumber: string;
  regionCode: string;

  // For display
  phoneNumber?: string;
  isMe?: boolean;
  name?: string;
  color?: ColorType;
  isVerified?: boolean;
  profileName?: string;
  title: string;
  avatarPath?: string;

  i18n: LocalizerType;
  updateSearchTerm: (searchTerm: string) => void;
  searchMessages: (
    query: string,
    options: {
      searchConversationId?: string;
      regionCode: string;
    }
  ) => void;
  searchDiscussions: (
    query: string,
    options: {
      ourConversationId: string;
      ourNumber: string;
      ourUuid: string;
      noteToSelf: string;
    }
  ) => void;

  clearConversationSearch: () => void;
  clearSearch: () => void;

  showArchivedConversations: () => void;
  // startComposing: () => void;
  setConverstion: (conversation:boolean) =>void;
}

interface StateType {
  showingAvatarPopup: boolean;
  popperRoot: HTMLDivElement | null;
  converstion:boolean
}

export class MainHeader extends React.Component<PropsType, StateType> {
  private readonly inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: PropsType) {
    super(props);

    this.inputRef = React.createRef();

    this.state = {
      showingAvatarPopup: false,
      popperRoot: null,
      converstion:false
    };
  }

  public componentDidUpdate(prevProps: PropsType) {
    const { searchConversationId, startSearchCounter } = this.props;

    // When user chooses to search in a given conversation we focus the field for them
    if (
      searchConversationId &&
      searchConversationId !== prevProps.searchConversationId
    ) {
      this.setFocus();
    }
    // When user chooses to start a new search, we focus the field
    if (startSearchCounter !== prevProps.startSearchCounter) {
      this.setSelected();
    }
  }

  public handleOutsideClick = ({ target }: MouseEvent) => {
    const { popperRoot, showingAvatarPopup } = this.state;

    if (
      showingAvatarPopup &&
      popperRoot &&
      !popperRoot.contains(target as Node)
    ) {
      this.hideAvatarPopup();
    }
  };

  public handleOutsideKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hideAvatarPopup();
    }
  };

  public showAvatarPopup = () => {
    const popperRoot = document.createElement('div');
    document.body.appendChild(popperRoot);

    this.setState({
      showingAvatarPopup: true,
      popperRoot,
    });
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('keydown', this.handleOutsideKeyDown);
  };

  public hideAvatarPopup = () => {
    const { popperRoot } = this.state;

    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleOutsideKeyDown);

    this.setState({
      showingAvatarPopup: false,
      popperRoot: null,
    });

    if (popperRoot && document.body.contains(popperRoot)) {
      document.body.removeChild(popperRoot);
    }
  };

  public componentWillUnmount() {
    const { popperRoot } = this.state;

    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('keydown', this.handleOutsideKeyDown);

    if (popperRoot && document.body.contains(popperRoot)) {
      document.body.removeChild(popperRoot);
    }
  }

  // tslint:disable-next-line member-ordering
  public search = debounce((searchTerm: string) => {
    const {
      i18n,
      ourConversationId,
      ourNumber,
      ourUuid,
      regionCode,
      searchDiscussions,
      searchMessages,
      searchConversationId,
    } = this.props;

    if (searchDiscussions && !searchConversationId) {
      searchDiscussions(searchTerm, {
        noteToSelf: i18n('noteToSelf').toLowerCase(),
        ourConversationId,
        ourNumber,
        ourUuid,
      });
    }

    if (searchMessages) {
      searchMessages(searchTerm, {
        searchConversationId,
        regionCode,
      });
    }
  }, 200);

  public updateSearch = (event: React.FormEvent<HTMLInputElement>) => {
    const {
      updateSearchTerm,
      clearConversationSearch,
      clearSearch,
      searchConversationId,
    } = this.props;
    const searchTerm = event.currentTarget.value;

    if (!searchTerm) {
      if (searchConversationId) {
        clearConversationSearch();
      } else {
        clearSearch();
      }

      return;
    }

    if (updateSearchTerm) {
      updateSearchTerm(searchTerm);
    }

    if (searchTerm.length < 2) {
      return;
    }

    this.search(searchTerm);
  };

  public clearSearch = () => {
    const { clearSearch } = this.props;

    clearSearch();
    this.setFocus();
  };

  public clearConversationSearch = () => {
    const { clearConversationSearch } = this.props;

    clearConversationSearch();
    this.setFocus();
  };

  public handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const {
      clearConversationSearch,
      clearSearch,
      searchConversationId,
      searchTerm,
    } = this.props;

    const { ctrlKey, metaKey, key } = event;
    const commandKey = get(window, 'platform') === 'darwin' && metaKey;
    const controlKey = get(window, 'platform') !== 'darwin' && ctrlKey;
    const commandOrCtrl = commandKey || controlKey;

    // On linux, this keyboard combination selects all text
    if (commandOrCtrl && key === '/') {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    if (key !== 'Escape') {
      return;
    }

    if (searchConversationId && searchTerm) {
      clearConversationSearch();
    } else {
      clearSearch();
    }

    event.preventDefault();
    event.stopPropagation();
  };

  public handleXButton = () => {
    const {
      searchConversationId,
      clearConversationSearch,
      clearSearch,
    } = this.props;

    if (searchConversationId) {
      clearConversationSearch();
    } else {
      clearSearch();
    }

    this.setFocus();
  };

  public setFocus = () => {
    if (this.inputRef.current) {
      // @ts-ignore
      this.inputRef.current.focus();
    }
  };

  public setSelected = () => {
    if (this.inputRef.current) {
      // @ts-ignore
      this.inputRef.current.select();
    }
  };

  // tslint:disable-next-line:max-func-body-length
  public render() {
    const {
      avatarPath,
      color,
      i18n,
      name,
      phoneNumber,
      profileName,
      title,
      searchConversationId,
      searchConversationName,
      searchTerm,
      showArchivedConversations,
      // startComposing,
      setConverstion
    } = this.props;
    const { showingAvatarPopup, popperRoot } = this.state;

    const isSearching = Boolean(
      searchConversationId || searchTerm.trim().length
    );

    const placeholder = searchConversationName
      ? i18n('searchIn', [searchConversationName])
      : i18n('search');

      if(this.state.converstion==true)  return ( <div className="module-main-header">
      <button
        onClick={()=>{
          setConverstion(false)
          this.setState({
            converstion: false
          });
        }}
        className="module-left-pane__header__contents__back-button"
        title={i18n('backToInbox')}
        aria-label={i18n('backToInbox')}
        type="button"
      />
      {/* <div className="module-left-pane__header__contents__text">
    
        New Conversation
      </div> */}
              <div className="module-main-header__search">
          {searchConversationId ? (
            <button
              className="module-main-header__search__in-conversation-pill"
              onClick={this.clearSearch}
              tabIndex={-1}
            >
              <div className="module-main-header__search__in-conversation-pill__avatar-container">
                <div className="module-main-header__search__in-conversation-pill__avatar" />
              </div>
              <div className="module-main-header__search__in-conversation-pill__x-button" />
            </button>
          ) : (
            <button
              className="module-main-header__search__icon"
              onClick={this.setFocus}
              tabIndex={-1}
            />
          )}
          <input
            type="text"
            ref={this.inputRef}
            className={classNames(
              'module-main-header__search__input',
              searchTerm
                ? 'module-main-header__search__input--with-text'
                : null,
              searchConversationId
                ? 'module-main-header__search__input--in-conversation'
                : null
            )}
            placeholder={placeholder}
            dir="auto"
            onKeyDown={this.handleKeyDown}
            value={searchTerm}
            onChange={this.updateSearch}
          />
          {searchTerm ? (
            <button
              tabIndex={-1}
              className="module-main-header__search__cancel-icon"
              onClick={this.handleXButton}
            />
          ) : null}
        </div>
    </div>)
    else{
    return (
      <div className="module-main-header">
        <Manager>
          <Reference>
            {({ ref }) => (
              <Avatar
                avatarPath={avatarPath}
                color={color}
                conversationType="direct"
                i18n={i18n}
                name={name}
                phoneNumber={phoneNumber}
                profileName={profileName}
                title={title}
                size={28}
                innerRef={ref}
                onClick={this.showAvatarPopup}
              />
            )}
          </Reference>
          {showingAvatarPopup && popperRoot
            ? createPortal(
                <Popper placement="bottom-end">
                  {({ ref, style }) => (
                    <AvatarPopup
                      innerRef={ref}
                      i18n={i18n}
                      style={style}
                      color={color}
                      conversationType="direct"
                      name={name}
                      phoneNumber={phoneNumber}
                      profileName={profileName}
                      title={title}
                      avatarPath={avatarPath}
                      size={28}
                      onViewPreferences={() => {
                        showSettings();
                        this.hideAvatarPopup();
                      }}
                      onViewArchive={() => {
                        showArchivedConversations();
                        this.hideAvatarPopup();
                      }}
                    />
                  )}
                </Popper>,
                popperRoot
              )
            : null}
        </Manager>
        <div className="module-main-header__search">
          {searchConversationId ? (
            <button
              className="module-main-header__search__in-conversation-pill"
              onClick={this.clearSearch}
              tabIndex={-1}
            >
              <div className="module-main-header__search__in-conversation-pill__avatar-container">
                <div className="module-main-header__search__in-conversation-pill__avatar" />
              </div>
              <div className="module-main-header__search__in-conversation-pill__x-button" />
            </button>
          ) : (
            <button
              className="module-main-header__search__icon"
              onClick={this.setFocus}
              tabIndex={-1}
            />
          )}
          <input
            type="text"
            ref={this.inputRef}
            className={classNames(
              'module-main-header__search__input',
              searchTerm
                ? 'module-main-header__search__input--with-text'
                : null,
              searchConversationId
                ? 'module-main-header__search__input--in-conversation'
                : null
            )}
            placeholder={placeholder}
            dir="auto"
            onKeyDown={this.handleKeyDown}
            value={searchTerm}
            onChange={this.updateSearch}
          />
          {searchTerm ? (
            <button
              tabIndex={-1}
              className="module-main-header__search__cancel-icon"
              onClick={this.handleXButton}
            />
          ) : null}
        </div>
        {!isSearching && (
          <button
            aria-label={i18n('newConversation')}
            className="module-main-header__compose-icon"
            onClick={()=>{
              setConverstion(true)
              this.setState({
                converstion: true
              });
            }}
            title={i18n('newConversation')}
            type="button"
          />
        )}
      </div>
    );
      }
  }
}
