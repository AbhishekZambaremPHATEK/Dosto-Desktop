import Measure, { BoundingRect, MeasuredComponentProps } from 'react-measure';
import React from 'react';
import { List } from 'react-virtualized';
import { debounce, get } from 'lodash';
import { Intl } from './Intl';
import {
  ConversationListItem,
  PropsData as ConversationListItemPropsType,
} from './ConversationListItem';
import {
  // PropsDataType as SearchResultsProps,
  SearchResults,
} from './SearchResults';
// import { LocalizerType } from '../types/Util';
import { cleanId } from './_util';

export interface PropsType {
  parent:any;
  // conversations?: Array<ConversationListItemPropsType>;
  // archivedConversations?: Array<ConversationListItemPropsType>;
  // selectedConversationId?: string;
  // searchResults?: SearchResultsProps;
  // showArchived?: boolean;

  // i18n: LocalizerType;

  // // Action Creators
  // startNewConversation: (
  //   query: string,
  //   options: { regionCode: string }
  // ) => void;
  // openConversationInternal: (id: string, messageId?: string) => void;
  // showArchivedConversations: () => void;
  // showInbox: () => void;

  // // Render Props
  // renderExpiredBuildDialog: () => JSX.Element;
  // renderMainHeader: (setConverstion:any) => JSX.Element;
  // renderMessageSearchResult: (id: string) => JSX.Element;
  // renderNetworkStatus: () => JSX.Element;
  // renderRelinkDialog: () => JSX.Element;
  // renderUpdateDialog: () => JSX.Element;
}

// from https://github.com/bvaughn/react-virtualized/blob/fb3484ed5dcc41bffae8eab029126c0fb8f7abc0/source/List/types.js#L5
type RowRendererParamsType = {
  index: number;
  isScrolling: boolean;
  isVisible: boolean;
  key: string;
  parent: Object;
  style: Object;
};

interface StateType {
  conversations22:ConversationListItemPropsType[]
}

export class LeftPane_2 extends React.Component<PropsType,StateType> {
  public listRef = React.createRef<any>();
  public containerRef = React.createRef<HTMLDivElement>();
  public setFocusToFirstNeeded = false;
  public setFocusToLastNeeded = false;
  
  constructor(props: PropsType) {
    super(props);
    this.state = {
      conversations22: [],
    };
    
    // window.log.info("my conversations 1 1",props.parent.conversations)

    // this.update();


    // window.log.info("my conversations 1 2",this.state.conversations22)
  }

  public update=()=>{
    let a: ConversationListItemPropsType[]=[]
    // let temp=false;
    this.props.parent.conversations.map((conversation: ConversationListItemPropsType, index: any) => {
      // if('lastUpdated' in conversation) {
      if (conversation.lastUpdated == null || undefined) {
        // if(conversation.temp==true){
        //   temp=false; 
        window.log.info("my conversations 1 1 if", index);
        // props.parent.conversations.splice(index, 1);
        // }
        // if(temp==false) 
        // {temp=true; conversations22.splice(index, 0, {...conversation,temp:true}); } 
      } else {
        a.push(conversation)
        window.log.info("my conversations 1 1 else", index);
      }
      // }
    })

    this.setState({
      conversations22:a, 
    });
  }

  componentDidMount(){
    this.update();
  }
  componentDidUpdate(prevProps:any, _prevState:any) {
    // if the current page changes, or the search term changes.
    if(prevProps.parent.conversations !== this.props.parent.conversations) {
      if (this.props.parent.conversations!=null||undefined) this.update();
    }
   }
  // componentDidUpdate(_prevProps:any, prevState:any) {
  //   // if the current page changes, or the search term changes.
  //   if(prevState.conversations22 !== this.props.parent.conversations22) {
  //     this.setState({
  //       conversations22: JSON.parse(JSON.stringify(this.props.parent.conversations))
  //     },()=>{
  //       window.log.info("my conversations 1",this.state.conversations22)
  
  //     // let temp=false;
  //     this.state.conversations22.map((conversation:any,index:any) => {
  //       // if('lastUpdated' in conversation) {
  //         if((conversation.lastUpdated == null) || !conversation.lastUpdated) 
  //         { 
  //           // if(conversation.temp==true){
  //           //   temp=false; 
  //           this.state.conversations22.splice(index, 1);
  //           // }
  //           // if(temp==false) 
  //           // {temp=true; conversations22.splice(index, 0, {...conversation,temp:true}); } 
  //         }
  //       // }
  //     })
  //       }); 
  //   }
  //  }

  public renderRow = ({
    index,
    key,
    style,
  }: RowRendererParamsType): JSX.Element => {
    const {
      archivedConversations,
      conversations,
      i18n,
      openConversationInternal,
      showArchived,
    } = this.props.parent;
    if (!conversations || !archivedConversations) {
      throw new Error(
        'renderRow: Tried to render without conversations or archivedConversations'
      );
    }

    if (!showArchived && index === this.state.conversations22.length) {
      return this.renderArchivedButton({ key, style });
    }

    // let conversations22=JSON.parse(JSON.stringify(conversations));
    // // window.log.info("my conversation 1",conversations22)
    // // let temp=false;
    // conversations22.map((conversation:ConversationListItemPropsType,index:any) => {
    //   // if('lastUpdated' in conversation) {
    //     if((conversation.lastUpdated == null) || !conversation.lastUpdated) 
    //     { 
    //       // if(conversation.temp==true){
    //       //   temp=false; 
    //         conversations22.splice(index, 1);
    //       // }
    //       // if(temp==false) 
    //       // {temp=true; conversations22.splice(index, 0, {...conversation,temp:true}); } 
    //     }
    //   // }
    // })

    // window.log.info("my conversation 2",conversations22)

    const conversation = showArchived
      ? archivedConversations[index]
      : this.state.conversations22[index];

    return (
      <>
      
      {conversation && conversation.id ?
        (conversation && conversation.temp==true ?
              <div
              key={key}
              className="module-left-pane__conversation-container"
              // style={{...style,height:'40px'}}
              style={style}
            >
           <div className="module-conversation-list__item--header" style={{paddingTop:'25px'}}>Contacts & Groups</div>
       
          </div>

          :
          <div
          key={key}
          className="module-left-pane__conversation-container"
          style={style}
        >
          <ConversationListItem
            {...conversation}
            onClick={(id:string)=>{
              // this.setState({
              //   converstion: false,
              // });
              openConversationInternal(id)}}
            i18n={i18n}
          />
        </div>
        
        )
        :''
        }
     


      </>
    );
  };

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
    } = this.props.parent;

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
    const { selectedConversationId } = this.props.parent;
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
    const { archivedConversations, conversations, showArchived } = this.props.parent;

    if (!conversations || !archivedConversations) {
      return 0;
    }

    // That extra 1 element added to the list is the 'archived conversations' button
    return showArchived
      ? archivedConversations.length
      : this.state.conversations22.length + (archivedConversations.length ? 1 : 0);
  };

  public  renderList = ({
    height,
    width,
  }: BoundingRect): JSX.Element | Array<JSX.Element | null> => {
    const {
      archivedConversations,
      i18n,
      conversations,
      openConversationInternal,
      renderMessageSearchResult,
      startNewConversation,
      searchResults,
      showArchived,
    } = this.props.parent;

    if (searchResults) {
      return (
        <SearchResults
          {...searchResults}
          height={height || 0}
          width={width || 0}
          openConversationInternal={openConversationInternal}
          startNewConversation={startNewConversation}
          renderMessageSearchResult={renderMessageSearchResult}
          i18n={i18n}
        />
      );
    }

    if (!conversations || !archivedConversations) {
      throw new Error(
        'render: must provided conversations and archivedConverstions if no search results are provided'
      );
    }

    const length = this.getLength();

    // We ensure that the listKey differs between inbox and archive views, which ensures
    //   that AutoSizer properly detects the new size of its slot in the flexbox. The
    //   archive explainer text at the top of the archive view causes problems otherwise.
    //   It also ensures that we scroll to the top when switching views.
    const listKey = showArchived ? 1 : 0;

    // Note: conversations is not a known prop for List, but it is required to ensure that
    //   it re-renders when our conversation data changes. Otherwise it would just render
    //   on startup and scroll.
    // if(!this.state.converstion){
    // conversations.map((conversation,index) => {
    //   if(conversation.lastUpdated==undefined || null) conversations.splice(index, 1);
    // })
    // }



  // old onepage sort code

    // window.log.info("my conversation 2",conversations22)
    // window.log.info("my conversations",conversations)
    // let conversations22=conversations;
    // this.setState({
    //   conversations22: conversations
    // });
    // if(this.state.converstion) {
    //   conversations.map((conversation,index) => {
    //       if(conversation.temp==true){
    //         conversations.splice(index, 1);
    //       }
    //   })
    //   conversations22.sort((a,b) => (a.name==undefined || b.name==undefined) ? 1:((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)))
    // }

    return (
      <div
        aria-live="polite"
        className="module-left-pane__list"
        key={listKey}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        ref={this.containerRef}
        role="group"
        tabIndex={-1}
      >
        <List
          className="module-left-pane__virtual-list"
          conversations={this.state.conversations22}
          height={height || 0}
          onScroll={this.onScroll}
          ref={this.listRef}
          rowCount={length}
          rowHeight={68}
          rowRenderer={this.renderRow}
          tabIndex={-1}
          width={width || 0}
        />
      </div>
    );
  };

  public renderArchivedHeader = (): JSX.Element => {
    const { i18n, showInbox } = this.props.parent;

    return (
      <div className="module-left-pane__archive-header">
        <button
          onClick={showInbox}
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
      i18n,
      renderExpiredBuildDialog,
      // renderMainHeader,
      renderNetworkStatus,
      renderRelinkDialog,
      renderUpdateDialog,
      showArchived,
    } = this.props.parent;

    /* tslint:disable no-non-null-assertion */
    return (
<>
        {renderExpiredBuildDialog()}
        {renderRelinkDialog()}
        {renderNetworkStatus()}
        {renderUpdateDialog()}
        {showArchived && (
          <div className="module-left-pane__archive-helper-text" key={0}>
            {i18n('archiveHelperText')}
          </div>
        )}
        
        {this.state.conversations22.length!=0 ? 
        <Measure bounds={true}>
          {({ contentRect, measureRef }: MeasuredComponentProps) => (
            <div className="module-left-pane__list--measure" ref={measureRef}>
              <div className="module-left-pane__list--wrapper">
                {this.renderList(contentRect.bounds!)}
              </div>
            </div>
          )}
        </Measure>
        :
        <div className="module-left-pane__empty">
          <div>
            <Intl
              i18n={i18n}
              id="emptyInboxMessage"
              components={[
                <span>
                  <strong>{i18n('composeIcon')}</strong>
                  <span className="module-left-pane__empty--composer_icon">
                    <i className="module-left-pane__empty--composer_icon--icon" />
                  </span>
                </span>,
              ]}
            />
          </div>
        </div>
        }
       </>
    );
  }
}
