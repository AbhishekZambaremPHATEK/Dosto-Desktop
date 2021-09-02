import { RefObject } from 'react';
import { connect } from 'react-redux';
// import { CanvasVideoRenderer, GumVideoCapturer } from 'ringrtc';
import { mapDispatchToProps } from '../actions';
import { CallManager } from '../../components/CallManager';
import { StateType } from '../reducer';
import { calling } from '../../services/calling';
// import { SmartCallingDeviceSelection } from './CallingDeviceSelection';
import { getIntl } from '../selectors/user';
// import React from 'react';


// function renderDeviceSelection(): JSX.Element {
//   return <SmartCallingDeviceSelection />;
// }

const mapStateToProps = (state: StateType) => {
  return {
    ...state.calling,
    i18n: getIntl(state),
    getVideoCapturer: (localVideoRef: RefObject<HTMLVideoElement>) =>
   {calling.videoCapturer.setLocalPreview(localVideoRef); return calling.videoCapturer},
      
      // new GumVideoCapturer({
      //   maxWidth: 640,
      //   maxHeight: 480,
      //   maxFramerate: 30,
      // }) ,
    getVideoRenderer: (remoteVideoRef: RefObject<HTMLCanvasElement>) =>
      // new CanvasVideoRenderer(remoteVideoRef),
      // new CanvasVideoRenderer(),
     { calling.videoRenderer.setCanvas(remoteVideoRef); return calling.videoRenderer },
      // renderDeviceSelection,
  };
};

const smart = connect(mapStateToProps, mapDispatchToProps);

export const SmartCallManager = smart(CallManager);
