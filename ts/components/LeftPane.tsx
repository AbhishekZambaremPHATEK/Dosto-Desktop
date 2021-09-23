// import { BoundingRect } from 'react-measure';
import React from 'react';
// import { List } from 'react-virtualized';
import { debounce, get } from 'lodash';
import { LeftPane_1 } from './LeftPane_1';
import { LeftPane_2 } from './LeftPane_2';
import {
  // ConversationListItem,
  PropsData as ConversationListItemPropsType,
} from './ConversationListItem';
import {
  PropsDataType as SearchResultsProps,
  // SearchResults,
} from './SearchResults';
import { LocalizerType } from '../types/Util';
import { cleanId } from './_util';

export interface PropsType {
  conversations?: Array<ConversationListItemPropsType>;
  archivedConversations?: Array<ConversationListItemPropsType>;
  selectedConversationId?: string;
  searchResults?: SearchResultsProps;
  showArchived?: boolean;

  i18n: LocalizerType;

  // Action Creators
  startNewConversation: (
    query: string,
    options: { regionCode: string }
  ) => void;
  openConversationInternal: (id: string, messageId?: string) => void;
  showArchivedConversations: () => void;
  showInbox: () => void;

  // Render Props
  renderExpiredBuildDialog: () => JSX.Element;
  renderMainHeader: (setConverstion:any) => JSX.Element;
  renderMessageSearchResult: (id: string) => JSX.Element;
  renderNetworkStatus: () => JSX.Element;
  renderRelinkDialog: () => JSX.Element;
  renderUpdateDialog: () => JSX.Element;
}

// from https://github.com/bvaughn/react-virtualized/blob/fb3484ed5dcc41bffae8eab029126c0fb8f7abc0/source/List/types.js#L5
// type RowRendererParamsType = {
//   index: number;
//   isScrolling: boolean;
//   isVisible: boolean;
//   key: string;
//   parent: Object;
//   style: Object;
// };

interface StateType {
  converstion:boolean,
  // conversations:ConversationListItemPropsType[],
  // conversations2:ConversationListItemPropsType[]
}

export class LeftPane extends React.Component<PropsType,StateType> {
  public listRef = React.createRef<any>();
  public containerRef = React.createRef<HTMLDivElement>();
  public setFocusToFirstNeeded = false;
  public setFocusToLastNeeded = false;
  
  constructor(props: PropsType) {
    super(props);
    this.state = {
      converstion:false,
      // conversations:props.conversations ? props.conversations : [],
      // conversations2:props.conversations ? props.conversations : [],
    };
  }

  // componentDidUpdate(_prevProps:any, prevState:any) {
  //   // if the current page changes, or the search term changes.
  //   if(prevState.conversations !== this.state.conversations) {
  //     this.setState({
  //     conversations2: this.state.conversations
  //     });
  //   }
  //  }
  // componentDidUpdate(prevProps:any, _prevState:any) {
  //   // if the current page changes, or the search term changes.
  //   // window.log.info("updsted 9")
  //   if(prevProps.conversations !== this.props.conversations) {
  //     window.log.info("updsted 1")
  //     this.forceUpdate();
  //   }
  //  }

  public setConverstion = (converstion:boolean)=>{
    this.setState({
      converstion: converstion,
      // conversations:this.props.conversations ? this.props.conversations : [],
    });
  }

  // public renderRow = ({
  //   index,
  //   key,
  //   style,
  // }: RowRendererParamsType): JSX.Element => {
  //   const {
  //     archivedConversations,
  //     conversations,
  //     i18n,
  //     openConversationInternal,
  //     showArchived,
  //   } = this.props;
  //   if (!conversations || !archivedConversations) {
  //     throw new Error(
  //       'renderRow: Tried to render without conversations or archivedConversations'
  //     );
  //   }

  //   if (!showArchived && index === conversations.length) {
  //     return this.renderArchivedButton({ key, style });
  //   }

  //   const conversation = showArchived
  //     ? archivedConversations[index]
  //     : this.state.converstion ? this.state.conversations2[index]: this.state.conversations[index];

  //   return (
  //     <>
      

  //       {conversation && conversation.temp==true ?
  //             <div
  //             key={key}
  //             className="module-left-pane__conversation-container"
  //             // style={{...style,height:'40px'}}
  //             style={style}
  //           >
  //          <div className="module-conversation-list__item--header" style={{paddingTop:'25px'}}>Contacts & Groups</div>
       
  //         </div>

  //         :
  //         <div
  //         key={key}
  //         className="module-left-pane__conversation-container"
  //         style={style}
  //       >
  //         <ConversationListItem
  //           {...conversation}
  //           onClick={(id:string)=>{
  //             // this.setState({
  //             //   converstion: false,
  //             // });
  //             openConversationInternal(id)}}
  //           i18n={i18n}
  //         />
  //       </div>
  //       }
     


  //     </>
  //   );
  // };

  public renderArchivedButton = ({
    key,
    style,
  }: {
    key: string;
    style: Object;
  }): JSX.Element => {
    const {
      archivedConversations,
      i18n,
      showArchivedConversations,
    } = this.props;

    if (!archivedConversations || !archivedConversations.length) {
      throw new Error(
        'renderArchivedButton: Tried to render without archivedConversations'
      );
    }

    return (
      <button
        key={key}
        className="module-left-pane__archived-button"
        style={style}
        onClick={showArchivedConversations}
      >
        {i18n('archivedConversations')}{' '}
        <span className="module-left-pane__archived-button__archived-count">
          {archivedConversations.length}
        </span>
      </button>
    );
  };

  public handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const commandKey = get(window, 'platform') === 'darwin' && event.metaKey;
    const controlKey = get(window, 'platform') !== 'darwin' && event.ctrlKey;
    const commandOrCtrl = commandKey || controlKey;

    if (commandOrCtrl && !event.shiftKey && event.key === 'ArrowUp') {
      this.scrollToRow(0);
      this.setFocusToFirstNeeded = true;

      event.preventDefault();
      event.stopPropagation();

      return;
    }

    if (commandOrCtrl && !event.shiftKey && event.key === 'ArrowDown') {
      const length = this.getLength();
      this.scrollToRow(length - 1);
      this.setFocusToLastNeeded = true;

      event.preventDefault();
      event.stopPropagation();

      return;
    }
  };

  public handleFocus = () => {
    const { selectedConversationId } = this.props;
    const { current: container } = this.containerRef;

    if (!container) {
      return;
    }

    if (document.activeElement === container) {
      const scrollingContainer = this.getScrollContainer();
      if (selectedConversationId && scrollingContainer) {
        const escapedId = cleanId(selectedConversationId).replace(
          /["\\]/g,
          '\\$&'
        );
        // tslint:disable-next-line no-unnecessary-type-assertion
        const target = scrollingContainer.querySelector(
          `.module-conversation-list-item[data-id="${escapedId}"]`
        ) as any;

        if (target && target.focus) {
          target.focus();

          return;
        }
      }

      this.setFocusToFirst();
    }
  };

  public scrollToRow = (row: number) => {
    if (!this.listRef || !this.listRef.current) {
      return;
    }

    this.listRef.current.scrollToRow(row);
  };

  public getScrollContainer = () => {
    if (!this.listRef || !this.listRef.current) {
      return;
    }

    const list = this.listRef.current;

    if (!list.Grid || !list.Grid._scrollingContainer) {
      return;
    }

    return list.Grid._scrollingContainer as HTMLDivElement;
  };

  public setFocusToFirst = () => {
    const scrollContainer = this.getScrollContainer();
    if (!scrollContainer) {
      return;
    }

    // tslint:disable-next-line no-unnecessary-type-assertion
    const item = scrollContainer.querySelector(
      '.module-conversation-list-item'
    ) as any;
    if (item && item.focus) {
      item.focus();

      return;
    }
  };

  // tslint:disable-next-line member-ordering
  public onScroll = debounce(
    () => {
      if (this.setFocusToFirstNeeded) {
        this.setFocusToFirstNeeded = false;
        this.setFocusToFirst();
      }
      if (this.setFocusToLastNeeded) {
        this.setFocusToLastNeeded = false;

        const scrollContainer = this.getScrollContainer();
        if (!scrollContainer) {
          return;
        }

        // tslint:disable-next-line no-unnecessary-type-assertion
        const button = scrollContainer.querySelector(
          '.module-left-pane__archived-button'
        ) as any;
        if (button && button.focus) {
          button.focus();

          return;
        }
        // tslint:disable-next-line no-unnecessary-type-assertion
        const items = scrollContainer.querySelectorAll(
          '.module-conversation-list-item'
        ) as any;
        if (items && items.length > 0) {
          const last = items[items.length - 1];

          if (last && last.focus) {
            last.focus();

            return;
          }
        }
      }
    },
    100,
    { maxWait: 100 }
  );

  public getLength = () => {
    const { archivedConversations, conversations, showArchived } = this.props;

    if (!conversations || !archivedConversations) {
      return 0;
    }

    // That extra 1 element added to the list is the 'archived conversations' button
    return showArchived
      ? archivedConversations.length
      : conversations.length + (archivedConversations.length ? 1 : 0);
  };

  // public renderList = ({
  //   height,
  //   width,
  // }: BoundingRect): JSX.Element | Array<JSX.Element | null> => {
  //   const {
  //     archivedConversations,
  //     i18n,
  //     conversations,
  //     openConversationInternal,
  //     renderMessageSearchResult,
  //     startNewConversation,
  //     searchResults,
  //     showArchived,
  //   } = this.props;

  //   if (searchResults) {
  //     return (
  //       <SearchResults
  //         {...searchResults}
  //         height={height || 0}
  //         width={width || 0}
  //         openConversationInternal={openConversationInternal}
  //         startNewConversation={startNewConversation}
  //         renderMessageSearchResult={renderMessageSearchResult}
  //         i18n={i18n}
  //       />
  //     );
  //   }

  //   if (!conversations || !archivedConversations) {
  //     throw new Error(
  //       'render: must provided conversations and archivedConverstions if no search results are provided'
  //     );
  //   }

  //   const length = this.getLength();

  //   // We ensure that the listKey differs between inbox and archive views, which ensures
  //   //   that AutoSizer properly detects the new size of its slot in the flexbox. The
  //   //   archive explainer text at the top of the archive view causes problems otherwise.
  //   //   It also ensures that we scroll to the top when switching views.
  //   const listKey = showArchived ? 1 : 0;

  //   // Note: conversations is not a known prop for List, but it is required to ensure that
  //   //   it re-renders when our conversation data changes. Otherwise it would just render
  //   //   on startup and scroll.
  //   // if(!this.state.converstion){
  //   // conversations.map((conversation,index) => {
  //   //   if(conversation.lastUpdated==undefined || null) conversations.splice(index, 1);
  //   // })
  //   // }

  // // old onepage sort code
  // if(!this.state.converstion){
  //   let temp=false;
  //   this.state.conversations.map((conversation,index) => {
  //     if(conversation.lastUpdated==undefined || null) 
  //     { 
  //       if(conversation.temp==true){
  //         temp=false; 
  //         this.state.conversations.splice(index, 1);
  //       }
  //       if(temp==false) 
  //       {temp=true; this.state.conversations.splice(index, 0, {...conversation,temp:true}); } 
  //     }
  //   })
  // }
  //   window.log.info("my conversations",this.state.conversations)
  //   // let conversations2=this.state.conversations;
  //   // this.setState({
  //   //   conversations2: this.state.conversations
  //   // });
  //   if(this.state.converstion) {
  //     this.state.conversations.map((conversation,index) => {
  //         if(conversation.temp==true){
  //           this.state.conversations.splice(index, 1);
  //         }
  //     })
  //     this.state.conversations2.sort((a,b) => (a.name==undefined || b.name==undefined) ? 1:((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)))
  //   }

  //   return (
  //     <div
  //       aria-live="polite"
  //       className="module-left-pane__list"
  //       key={listKey}
  //       onFocus={this.handleFocus}
  //       onKeyDown={this.handleKeyDown}
  //       ref={this.containerRef}
  //       role="group"
  //       tabIndex={-1}
  //     >
  //       <List
  //         className="module-left-pane__virtual-list"
  //         conversations={this.state.converstion ? this.state.conversations2:this.state.conversations}
  //         height={height || 0}
  //         onScroll={this.onScroll}
  //         ref={this.listRef}
  //         rowCount={length}
  //         rowHeight={68}
  //         rowRenderer={this.renderRow}
  //         tabIndex={-1}
  //         width={width || 0}
  //       />
  //     </div>
  //   );
  // };

  public renderArchivedHeader = (): JSX.Element => {
    const { i18n, showInbox } = this.props;

    return (
      <div className="module-left-pane__archive-header">
        <button
          onClick={() =>{
            this.setConverstion(false);
            showInbox();
          }}
          className="module-left-pane__to-inbox-button"
          title={i18n('backToInbox')}
        />
        <div className="module-left-pane__archive-header-text">
          {i18n('archivedConversations')}
        </div>
      </div>
    );
  };

  public render(): JSX.Element {
    const {
      // i18n,
      // renderExpiredBuildDialog,
      renderMainHeader,
      // renderNetworkStatus,
      // renderRelinkDialog,
      // renderUpdateDialog,
      showArchived,
    } = this.props;

    /* tslint:disable no-non-null-assertion */
    return (
      <div className="module-left-pane">
        <div className="module-left-pane__header">
          {showArchived ? this.renderArchivedHeader() : renderMainHeader(this.setConverstion)}
        </div>
        {this.state.converstion==true ? (<>
          {/* <Measure bounds={true}>
          {({ contentRect, measureRef }: MeasuredComponentProps) => (
            <div className="module-left-pane__list--measure" ref={measureRef}>
              <div className="module-left-pane__list--wrapper">
                {this.renderList(contentRect.bounds!)}
              </div>
            </div>
          )}
        </Measure> */}
        <LeftPane_1 parent={this.props}></LeftPane_1>
        </>):(<>
        {/* {renderExpiredBuildDialog()}
        {renderRelinkDialog()}
        {renderNetworkStatus()}
        {renderUpdateDialog()}
        {showArchived && (
          <div className="module-left-pane__archive-helper-text" key={0}>
            {i18n('archiveHelperText')}
          </div>
        )}
        <Measure bounds={true}>
          {({ contentRect, measureRef }: MeasuredComponentProps) => (
            <div className="module-left-pane__list--measure" ref={measureRef}>
              <div className="module-left-pane__list--wrapper">
                {this.renderList(contentRect.bounds!)}
              </div>
            </div>
          )}
        </Measure> */}
        <LeftPane_2 parent={this.props}></LeftPane_2>
        </>)}
      </div>
    );
  }
}
