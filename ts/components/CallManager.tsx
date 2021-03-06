import React from 'react';
import { useState } from 'react';
import { CallScreen, PropsType as CallScreenPropsType } from './CallScreen';
import {
  IncomingCallBar,
  PropsType as IncomingCallBarPropsType,
} from './IncomingCallBar';
import { CallState } from '../types/Calling';
import { CallDetailsType } from '../state/ducks/calling';
import { SmartCallingDeviceSelection } from '../state/smart/CallingDeviceSelection';


type CallManagerPropsType = {
  callDetails?: CallDetailsType;
  callState?: CallState;
  renderDeviceSelection: () => JSX.Element;
};
type PropsType = IncomingCallBarPropsType &
  CallScreenPropsType &
  CallManagerPropsType;

export const CallManager = ({
  acceptCall,
  callDetails,
  callState,
  declineCall,
  getVideoCapturer,
  getVideoRenderer,
  hangUp,
  hasLocalAudio,
  hasLocalVideo,
  hasRemoteVideo,
  i18n,
  setLocalAudio,
  setLocalVideo,
  setVideoCapturer,
  setVideoRenderer,
  // renderDeviceSelection
}: PropsType): JSX.Element | null => {

  const [settingsDialogOpen, setsettingsDialogOpen] = useState(false);

  if (!callDetails || !callState) {
    return null;
  }
  const incoming = callDetails.isIncoming;
  const outgoing = !incoming;
  const ongoing =
    callState === CallState.Accepted || callState === CallState.Reconnecting;
  const ringing = callState === CallState.Ringing;

  if (outgoing || ongoing) {
    return ( 
      <>
      <CallScreen
        callDetails={callDetails}
        callState={callState}
        getVideoCapturer={getVideoCapturer}
        getVideoRenderer={getVideoRenderer}
        hangUp={hangUp}
        hasLocalAudio={hasLocalAudio}
        hasLocalVideo={hasLocalVideo}
        i18n={i18n}
        hasRemoteVideo={hasRemoteVideo}
        setVideoCapturer={setVideoCapturer}
        setVideoRenderer={setVideoRenderer}
        setLocalAudio={setLocalAudio}
        setLocalVideo={setLocalVideo}
        toggleSettings={()=>setsettingsDialogOpen(true)}
      />
      {/* {settingsDialogOpen && renderDeviceSelection()} */}
      {settingsDialogOpen && <SmartCallingDeviceSelection toggleSettings={()=>setsettingsDialogOpen(!settingsDialogOpen)}/>}
      </>
    );
  }

  if (incoming && ringing) {
    return (
      <IncomingCallBar
        acceptCall={acceptCall}
        callDetails={callDetails}
        declineCall={declineCall}
        i18n={i18n}
      />
    );
  }

  // Ended || (Incoming && Prering)
  return null;
};
