import { notify } from '../../services/notify';
import { calling, VideoCapturer, VideoRenderer } from '../../services/calling';
import { CallState,  ChangeIODevicePayloadType,  MediaDeviceSettings,CallingDeviceType } from '../../types/Calling';
import { CanvasVideoRenderer, GumVideoCapturer } from '../../window.d';
import { ColorType } from '../../types/Colors';
import { NoopActionType } from './noop';
import { callingTones } from '../../util/callingTones';
import { requestCameraPermissions } from '../../util/callingPermissions';
import {
  bounceAppIconStart,
  bounceAppIconStop,
} from '../../shims/bounceAppIcon';
// import { ThunkAction } from 'redux-thunk';
// import { StateType as RootStateType } from '../reducer';

// State

export type CallId = any;

export type CallDetailsType = {
  callId: CallId;
  isIncoming: boolean;
  isVideoCall: boolean;

  avatarPath?: string;
  color?: ColorType;
  name?: string;
  phoneNumber?: string;
  profileName?: string;
  title: string;
}; 

export type CallingStateType = MediaDeviceSettings & {
  callDetails?: CallDetailsType;
  callState?: CallState;
  hasLocalAudio: boolean;
  hasLocalVideo: boolean;
  hasRemoteVideo: boolean;
};

export type AcceptCallType = {
  callId: CallId;
  asVideoCall: boolean;
};

export type CallStateChangeType = {
  callState: CallState;
  callDetails: CallDetailsType;
};

export type DeclineCallType = {
  callId: CallId;
};

export type HangUpType = {
  callId: CallId;
};

export type IncomingCallType = {
  callDetails: CallDetailsType;
};

export type OutgoingCallType = {
  callDetails: CallDetailsType;
};

export type RemoteVideoChangeType = {
  remoteVideoEnabled: boolean;
};

export type SetLocalAudioType = {
  callId: CallId;
  enabled: boolean;
};

export type SetLocalVideoType = {
  callId: CallId;
  enabled: boolean;
};

export type SetVideoCapturerType = {
  callId: CallId;
  capturer: CanvasVideoRenderer | null;
};

export type SetVideoRendererType = {
  callId: CallId;
  renderer: GumVideoCapturer | null;
};

// Actions

const ACCEPT_CALL = 'calling/ACCEPT_CALL';
const CALL_STATE_CHANGE = 'calling/CALL_STATE_CHANGE';
const CALL_STATE_CHANGE_FULFILLED = 'calling/CALL_STATE_CHANGE_FULFILLED';
const DECLINE_CALL = 'calling/DECLINE_CALL';
const HANG_UP = 'calling/HANG_UP';
const INCOMING_CALL = 'calling/INCOMING_CALL';
const OUTGOING_CALL = 'calling/OUTGOING_CALL';
const REMOTE_VIDEO_CHANGE = 'calling/REMOTE_VIDEO_CHANGE';
const SET_LOCAL_AUDIO = 'calling/SET_LOCAL_AUDIO';
const SET_LOCAL_VIDEO = 'calling/SET_LOCAL_VIDEO';
const SET_LOCAL_VIDEO_FULFILLED = 'calling/SET_LOCAL_VIDEO_FULFILLED';
const CHANGE_IO_DEVICE_FULFILLED = 'calling/CHANGE_IO_DEVICE_FULFILLED';
const REFRESH_IO_DEVICES = 'calling/REFRESH_IO_DEVICES';

type AcceptCallActionType = {
  type: 'calling/ACCEPT_CALL';
  payload: AcceptCallType;
};

type CallStateChangeActionType = {
  type: 'calling/CALL_STATE_CHANGE';
  payload: Promise<CallStateChangeType>;
};

type CallStateChangeFulfilledActionType = {
  type: 'calling/CALL_STATE_CHANGE_FULFILLED';
  payload: CallStateChangeType;
};

type DeclineCallActionType = {
  type: 'calling/DECLINE_CALL';
  payload: DeclineCallType;
};

type HangUpActionType = {
  type: 'calling/HANG_UP';
  payload: HangUpType;
};

type IncomingCallActionType = {
  type: 'calling/INCOMING_CALL';
  payload: IncomingCallType;
};

type OutgoingCallActionType = {
  type: 'calling/OUTGOING_CALL';
  payload: OutgoingCallType;
};

type RemoteVideoChangeActionType = {
  type: 'calling/REMOTE_VIDEO_CHANGE';
  payload: RemoteVideoChangeType;
};

type SetLocalAudioActionType = {
  type: 'calling/SET_LOCAL_AUDIO';
  payload: SetLocalAudioType;
};

type SetLocalVideoActionType = {
  type: 'calling/SET_LOCAL_VIDEO';
  payload: Promise<SetLocalVideoType>;
};

type SetLocalVideoFulfilledActionType = {
  type: 'calling/SET_LOCAL_VIDEO_FULFILLED';
  payload: SetLocalVideoType;
};

type ChangeIODeviceFulfilledActionType = {
  type: 'calling/CHANGE_IO_DEVICE_FULFILLED';
  payload: ChangeIODevicePayloadType;
};

type RefreshIODevicesActionType = {
  type: 'calling/REFRESH_IO_DEVICES';
  payload: MediaDeviceSettings;
};

export type CallingActionType =
| ChangeIODeviceFulfilledActionType
| RefreshIODevicesActionType
  | AcceptCallActionType
  | CallStateChangeActionType
  | CallStateChangeFulfilledActionType
  | DeclineCallActionType
  | HangUpActionType
  | IncomingCallActionType
  | OutgoingCallActionType
  | RemoteVideoChangeActionType
  | SetLocalAudioActionType
  | SetLocalVideoActionType
  | SetLocalVideoFulfilledActionType;

// Action Creators

function acceptCall(
  payload: AcceptCallType
): AcceptCallActionType | NoopActionType {
  // tslint:disable-next-line no-floating-promises
  (async () => {
    try {
      await calling.accept(payload.callId, payload.asVideoCall);
    } catch (err) {
      window.log.error(`Failed to acceptCall: ${err.stack}`);
    }
  })();

  return {
    type: ACCEPT_CALL,
    payload,
  };
}

function callStateChange(
  payload: CallStateChangeType
): CallStateChangeActionType {
  return {
    type: CALL_STATE_CHANGE,
    payload: doCallStateChange(payload),
  };
}

function refreshIODevices(
  payload: MediaDeviceSettings
): RefreshIODevicesActionType {
  return {
    type: REFRESH_IO_DEVICES,
    payload,
  };
}

async function doCallStateChange(
  payload: CallStateChangeType
): Promise<CallStateChangeType> {
  const { callDetails, callState } = payload;
  const { isIncoming } = callDetails;
  if (callState === CallState.Ringing && isIncoming) {
    let loading=window.localStorage.getItem('loading');
    loading!=null && JSON.parse(loading)===false && await callingTones.playRingtone();
    // if(window.localStorage.getItem('loading')=='false') await callingTones.playRingtone();
    await showCallNotification(callDetails);
    bounceAppIconStart();
  }
  if (callState !== CallState.Ringing) {
    callingTones.stopRingtone();
    bounceAppIconStop();
  }
  if (callState === CallState.Ended) {
    let loading=window.localStorage.getItem('loading');
    loading!=null && JSON.parse(loading)===false && callingTones.playEndCall();
  }
  return payload;
}

async function showCallNotification(callDetails: CallDetailsType) {
  const canNotify = await window.getCallSystemNotification();
  if (!canNotify) {
    return;
  }
  window.log.info('callDetails Parameters')
  window.log.info('isIncoming',callDetails.isIncoming)
  window.log.info('isVideoCall',callDetails.isVideoCall)
  window.log.info('name',callDetails.name)
  window.log.info('phoneNumber',callDetails.phoneNumber)
  window.log.info('profileName',callDetails.profileName)
  window.log.info('title',callDetails.title)

  const { title, isVideoCall } = callDetails;
  notify({
    platform: window.platform,
    title,
    icon: isVideoCall
      ? 'images/icons/v2/video-solid-24.svg'
      : 'images/icons/v2/phone-right-solid-24.svg',
    message: window.i18n(
      isVideoCall ? 'incomingVideoCall' : 'incomingAudioCall'
    ),
    onNotificationClick: () => {
      window.showWindow();
    },
    silent: false,
  });
}

function declineCall(payload: DeclineCallType): DeclineCallActionType {
  calling.decline(payload.callId);

  return {
    type: DECLINE_CALL,
    payload,
  };
}

function hangUp(payload: HangUpType): HangUpActionType {
  calling.hangup(payload.callId);

  return {
    type: HANG_UP,
    payload,
  };
}

function incomingCall(payload: IncomingCallType): IncomingCallActionType {
  // callingTones.playRingtone();
  return {
    type: INCOMING_CALL,
    payload,
  };
}

function outgoingCall(payload: OutgoingCallType): OutgoingCallActionType {
  // tslint:disable-next-line no-floating-promises
  callingTones.playRingtone();

  return {
    type: OUTGOING_CALL,
    payload,
  };
}

function remoteVideoChange(
  payload: RemoteVideoChangeType
): RemoteVideoChangeActionType {
  return {
    type: REMOTE_VIDEO_CHANGE,
    payload,
  };
}

function setVideoCapturer(payload: SetVideoCapturerType): NoopActionType {
  calling.setVideoCapturer(payload.callId, payload.capturer as VideoCapturer);

  return {
    type: 'NOOP',
    payload: null,
  };
}

function setVideoRenderer(payload: SetVideoRendererType): NoopActionType {
  calling.setVideoRenderer(payload.callId, payload.renderer as VideoRenderer);

  return {
    type: 'NOOP',
    payload: null,
  };
}

function setLocalAudio(payload: SetLocalAudioType): SetLocalAudioActionType {
  calling.setOutgoingAudio(payload.callId, payload.enabled);

  return {
    type: SET_LOCAL_AUDIO,
    payload,
  };
}

function setLocalVideo(payload: SetLocalVideoType): SetLocalVideoActionType {
  return {
    type: SET_LOCAL_VIDEO,
    payload: doSetLocalVideo(payload),
  };
}

async function doSetLocalVideo(
  payload: SetLocalVideoType
): Promise<SetLocalVideoType> {
  if (await requestCameraPermissions()) {
    calling.setOutgoingVideo(payload.callId, payload.enabled);
    return payload;
  }

  return {
    ...payload,
    enabled: false,
  };
}



async function changeIODevice(
  payload: ChangeIODevicePayloadType
)
 {
  // return async dispatch => {
    // Only `setPreferredCamera` returns a Promise.
    if (payload.type === CallingDeviceType.CAMERA) {
      await calling.setPreferredCamera(payload.selectedDevice);
    } else if (payload.type === CallingDeviceType.MICROPHONE) {
      calling.setPreferredMicrophone(payload.selectedDevice);
    } else if (payload.type === CallingDeviceType.SPEAKER) {
      calling.setPreferredSpeaker(payload.selectedDevice);
    }
    return({
      type: CHANGE_IO_DEVICE_FULFILLED,
      payload,
    });
  // };
}


export const actions = {
  changeIODevice,
  refreshIODevices,
  acceptCall,
  callStateChange,
  declineCall,
  hangUp,
  incomingCall,
  outgoingCall,
  remoteVideoChange,
  setVideoCapturer,
  setVideoRenderer,
  setLocalAudio,
  setLocalVideo,
};

export type ActionsType = typeof actions;

// Reducer

function getEmptyState(): CallingStateType {
  return {

    availableCameras: [],
    availableMicrophones: [],
    availableSpeakers: [],
    selectedCamera: undefined,
    selectedMicrophone: undefined,
    selectedSpeaker: undefined,
    
    callDetails: undefined,
    callState: undefined,
    hasLocalAudio: false,
    hasLocalVideo: false,
    hasRemoteVideo: false,
  };
}

export function reducer(
  state: CallingStateType = getEmptyState(),
  action: CallingActionType
): CallingStateType {
  if (action.type === ACCEPT_CALL) {
    return {
      ...state,
      hasLocalAudio: true,
      hasLocalVideo: action.payload.asVideoCall,
    };
  }

  if (action.type === DECLINE_CALL || action.type === HANG_UP) {
    return getEmptyState();
  }

  if (action.type === INCOMING_CALL) {
    return {
      ...state,
      callDetails: action.payload.callDetails,
      callState: CallState.Prering,
      hasLocalAudio: true,
      hasLocalVideo: action.payload.callDetails.isVideoCall,
    };
  }

  if (action.type === OUTGOING_CALL) {
    return {
      ...state,
      callDetails: action.payload.callDetails,
      callState: CallState.Prering,
      hasLocalAudio: true,
      hasLocalVideo: action.payload.callDetails.isVideoCall,
    };
  }

  if (action.type === CHANGE_IO_DEVICE_FULFILLED) {
    const { selectedDevice } = action.payload;
    const nextState = Object.create(null);

    if (action.payload.type === CallingDeviceType.CAMERA) {
      nextState.selectedCamera = selectedDevice;
    } else if (action.payload.type === CallingDeviceType.MICROPHONE) {
      nextState.selectedMicrophone = selectedDevice;
    } else if (action.payload.type === CallingDeviceType.SPEAKER) {
      nextState.selectedSpeaker = selectedDevice;
    }

    return {
      ...state,
      ...nextState,
    };
  }


  if (action.type === REFRESH_IO_DEVICES) {
    const {
      availableMicrophones,
      selectedMicrophone,
      availableSpeakers,
      selectedSpeaker,
      availableCameras,
      selectedCamera,
    } = action.payload;

    return {
      ...state,
      availableMicrophones,
      selectedMicrophone,
      availableSpeakers,
      selectedSpeaker,
      availableCameras,
      selectedCamera,
    };
  }


  if (action.type === CALL_STATE_CHANGE_FULFILLED) {
    if (action.payload.callState === CallState.Ended) {
      return getEmptyState();
    }
    return {
      ...state,
      callState: action.payload.callState,
    };
  }

  if (action.type === REMOTE_VIDEO_CHANGE) {
    return {
      ...state,
      hasRemoteVideo: action.payload.remoteVideoEnabled,
    };
  }

  if (action.type === SET_LOCAL_AUDIO) {
    return {
      ...state,
      hasLocalAudio: action.payload.enabled,
    };
  }

  if (action.type === SET_LOCAL_VIDEO_FULFILLED) {
    return {
      ...state,
      hasLocalVideo: action.payload.enabled,
    };
  }

  return state;
}
