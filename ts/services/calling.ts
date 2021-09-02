import {
  Call,
  CallEndedReason,
  CallId,
  CallLogLevel,
  CallSettings,
  CallState,
  CanvasVideoRenderer,
  DeviceId,
  GumVideoCapturer,
  RingRTC,
  UserId,
  VideoCapturer,
  VideoRenderer,
  // BandwidthMode,
  // HangupMessage,
  // CallingMessage,
} from 'ringrtc';
// import { dropNull, shallowDropNull } from '../util/dropNull';
import {
  ActionsType as UxActionsType,
  CallDetailsType,
} from '../state/ducks/calling';
import { CallingMessageClass, EnvelopeClass } from '../textsecure.d';
import { ConversationModelType } from '../model-types.d';
import is from '@sindresorhus/is';
import { AudioDevice, MediaDeviceSettings } from '../types/Calling';
import {
  REQUESTED_VIDEO_WIDTH,
  REQUESTED_VIDEO_HEIGHT,
  REQUESTED_VIDEO_FRAMERATE,
} from '../calling/constants';

export {
  CallState,
  CanvasVideoRenderer,
  GumVideoCapturer,
  VideoCapturer,
  VideoRenderer,
} from 'ringrtc';

export type CallHistoryDetailsType = {
  wasIncoming: boolean;
  wasVideoCall: boolean;
  wasDeclined: boolean;
  acceptedTime?: number;
  endedTime: number;
};

export class CallingClass {
  private uxActions?: UxActionsType;
  private deviceReselectionTimer?: NodeJS.Timeout;
  readonly videoCapturer: GumVideoCapturer;
  readonly videoRenderer: CanvasVideoRenderer;
  private lastMediaDeviceSettings?: MediaDeviceSettings;

  constructor() {
    this.videoCapturer = new GumVideoCapturer(
      REQUESTED_VIDEO_WIDTH,
      REQUESTED_VIDEO_HEIGHT,
      REQUESTED_VIDEO_FRAMERATE,
    );
    this.videoRenderer = new CanvasVideoRenderer();
  }
  private async startDeviceReselectionTimer(): Promise<void> {
    // Poll once
    await this.pollForMediaDevices();
    // Start the timer
    if (!this.deviceReselectionTimer) {
      this.deviceReselectionTimer = setInterval(async () => {
        await this.pollForMediaDevices();
      }, 3000);
    }
  }

  private mediaDeviceSettingsEqual(
    a?: MediaDeviceSettings,
    b?: MediaDeviceSettings
  ): boolean {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    if (
      a.availableCameras.length !== b.availableCameras.length ||
      a.availableMicrophones.length !== b.availableMicrophones.length ||
      a.availableSpeakers.length !== b.availableSpeakers.length
    ) {
      return false;
    }
    for (let i = 0; i < a.availableCameras.length; i += 1) {
      if (
        a.availableCameras[i].deviceId !== b.availableCameras[i].deviceId ||
        a.availableCameras[i].groupId !== b.availableCameras[i].groupId ||
        a.availableCameras[i].label !== b.availableCameras[i].label
      ) {
        return false;
      }
    }
    for (let i = 0; i < a.availableMicrophones.length; i += 1) {
      if (
        a.availableMicrophones[i].name !== b.availableMicrophones[i].name ||
        a.availableMicrophones[i].uniqueId !==
          b.availableMicrophones[i].uniqueId
      ) {
        return false;
      }
    }
    for (let i = 0; i < a.availableSpeakers.length; i += 1) {
      if (
        a.availableSpeakers[i].name !== b.availableSpeakers[i].name ||
        a.availableSpeakers[i].uniqueId !== b.availableSpeakers[i].uniqueId
      ) {
        return false;
      }
    }
    if (
      (a.selectedCamera && !b.selectedCamera) ||
      (!a.selectedCamera && b.selectedCamera) ||
      (a.selectedMicrophone && !b.selectedMicrophone) ||
      (!a.selectedMicrophone && b.selectedMicrophone) ||
      (a.selectedSpeaker && !b.selectedSpeaker) ||
      (!a.selectedSpeaker && b.selectedSpeaker)
    ) {
      return false;
    }
    if (
      a.selectedCamera &&
      b.selectedCamera &&
      a.selectedCamera !== b.selectedCamera
    ) {
      return false;
    }
    if (
      a.selectedMicrophone &&
      b.selectedMicrophone &&
      a.selectedMicrophone.index !== b.selectedMicrophone.index
    ) {
      return false;
    }
    if (
      a.selectedSpeaker &&
      b.selectedSpeaker &&
      a.selectedSpeaker.index !== b.selectedSpeaker.index
    ) {
      return false;
    }
    return true;
  }
  
  private async selectPreferredDevices(
    settings: MediaDeviceSettings
  ): Promise<void> {
    if (
      (!this.lastMediaDeviceSettings && settings.selectedCamera) ||
      (this.lastMediaDeviceSettings &&
        settings.selectedCamera &&
        this.lastMediaDeviceSettings.selectedCamera !== settings.selectedCamera)
    ) {
      window.log.info('MediaDevice: selecting camera', settings.selectedCamera);
      await this.videoCapturer.setPreferredDevice(settings.selectedCamera);
    }

    // Assume that the MediaDeviceSettings have been obtained very recently and
    // the index is still valid (no devices have been plugged in in between).
    if (settings.selectedMicrophone) {
      window.log.info(
        'MediaDevice: selecting microphone',
        settings.selectedMicrophone
      );
      RingRTC.setAudioInput(settings.selectedMicrophone.index);
    }

    if (settings.selectedSpeaker) {
      window.log.info(
        'MediaDevice: selecting speaker',
        settings.selectedSpeaker
      );
      RingRTC.setAudioOutput(settings.selectedSpeaker.index);
    }
  }
  
  private async pollForMediaDevices(): Promise<void> {
    const newSettings = await this.getMediaDeviceSettings();
    if (
      !this.mediaDeviceSettingsEqual(this.lastMediaDeviceSettings, newSettings)
    ) {
      window.log.info(
        'MediaDevice: available devices changed (from->to)',
        this.lastMediaDeviceSettings,
        newSettings
      );

      await this.selectPreferredDevices(newSettings);
      this.lastMediaDeviceSettings = newSettings;
      this.uxActions?.refreshIODevices(newSettings);
    }
  }

  findBestMatchingDeviceIndex(
    available: Array<AudioDevice>,
    preferred: AudioDevice | undefined
  ): number | undefined {
    if (preferred) {
      // Match by uniqueId first, if available
      if (preferred.uniqueId) {
        const matchIndex = available.findIndex(
          d => d.uniqueId === preferred.uniqueId
        );
        if (matchIndex !== -1) {
          return matchIndex;
        }
      }
      // Match by name second
      const matchingNames = available.filter(d => d.name === preferred.name);
      if (matchingNames.length > 0) {
        return matchingNames[0].index;
      }
    }
    // Nothing matches or no preference; take the first device if there are any
    return available.length > 0 ? 0 : undefined;
  }

  findBestMatchingCamera(
    available: Array<MediaDeviceInfo>,
    preferred?: string
  ): string | undefined {
    const matchingId = available.filter(d => d.deviceId === preferred);
    const nonInfrared = available.filter(d => !d.label.includes('IR Camera'));

    // By default, pick the first non-IR camera (but allow the user to pick the
    // infrared if they so desire)
    if (matchingId.length > 0) {
      return matchingId[0].deviceId;
    }
    if (nonInfrared.length > 0) {
      return nonInfrared[0].deviceId;
    }

    return undefined;
  }

  async getMediaDeviceSettings(): Promise<MediaDeviceSettings> {
    const availableMicrophones = RingRTC.getAudioInputs();
    const preferredMicrophone = window.storage.get(
      'preferred-audio-input-device'
    );
    const selectedMicIndex = this.findBestMatchingDeviceIndex(
      availableMicrophones,
      preferredMicrophone
    );
    const selectedMicrophone =
      selectedMicIndex !== undefined
        ? availableMicrophones[selectedMicIndex]
        : undefined;

    const availableSpeakers = RingRTC.getAudioOutputs();
    const preferredSpeaker = window.storage.get(
      'preferred-audio-output-device'
    );
    const selectedSpeakerIndex = this.findBestMatchingDeviceIndex(
      availableSpeakers,
      preferredSpeaker
    );
    const selectedSpeaker =
      selectedSpeakerIndex !== undefined
        ? availableSpeakers[selectedSpeakerIndex]
        : undefined;

    const availableCameras = await this.videoCapturer.enumerateDevices();
    const preferredCamera = window.storage.get('preferred-video-input-device');
    const selectedCamera = this.findBestMatchingCamera(
      availableCameras,
      preferredCamera
    );

    return {
      availableMicrophones,
      availableSpeakers,
      selectedMicrophone,
      selectedSpeaker,
      availableCameras,
      selectedCamera,
    };
  }


  async setPreferredCamera(device: string): Promise<void> {
    window.log.info('MediaDevice: setPreferredCamera', device);
    window.storage.put('preferred-video-input-device', device);
    this.setOutgoingVideo(device,true)
    await this.videoCapturer.setPreferredDevice(device);
  }

  setPreferredMicrophone(device: AudioDevice): void {
    window.log.info('MediaDevice: setPreferredMicrophone', device);
    window.storage.put('preferred-audio-input-device', device);
    this.setOutgoingAudio(device.index,true)
    RingRTC.setAudioInput(device.index);

  }

  setPreferredSpeaker(device: AudioDevice): void {
    window.log.info('MediaDevice: setPreferredSpeaker', device);
    window.storage.put('preferred-audio-output-device', device);
    RingRTC.setAudioOutput(device.index);
    
  }

  initialize(uxActions: UxActionsType): void {
    this.uxActions = uxActions;
    if (!uxActions) {
      throw new Error('CallingClass.initialize: Invalid uxActions.');
    }
    if (!is.function_(uxActions.incomingCall)) {
      throw new Error(
        'CallingClass.initialize: Invalid uxActions.incomingCall'
      );
    }
    if (!is.function_(uxActions.outgoingCall)) {
      throw new Error(
        'CallingClass.initialize: Invalid uxActions.outgoingCall'
      );
    }
    if (!is.function_(uxActions.callStateChange)) {
      throw new Error(
        'CallingClass.initialize: Invalid uxActions.callStateChange'
      );
    }
    if (!is.function_(uxActions.remoteVideoChange)) {
      throw new Error(
        'CallingClass.initialize: Invalid uxActions.remoteVideoChange'
      );
    }
    RingRTC.handleOutgoingSignaling = this.handleOutgoingSignaling.bind(this);
    RingRTC.handleIncomingCall = this.handleIncomingCall.bind(this);
    RingRTC.handleAutoEndedIncomingCallRequest = this.handleAutoEndedIncomingCallRequest.bind(
      this
    );
    RingRTC.handleLogMessage = this.handleLogMessage.bind(this);
  }

  async startOutgoingCall(
    conversation: ConversationModelType,
    isVideoCall: boolean
  ) {
    if (!this.uxActions) {
      window.log.error('Missing uxActions, new call not allowed.');
      return;
    }

    if (RingRTC.call && RingRTC.call.state !== CallState.Ended) {
      window.log.info('Call already in progress, new call not allowed.');
      return;
    }

    const remoteUserId = this.getRemoteUserIdFromConversation(conversation);
    if (!remoteUserId || !this.localDeviceId) {
      window.log.error('Missing identifier, new call not allowed.');
      return;
    }

    const haveMediaPermissions = await this.requestPermissions(isVideoCall);
    if (!haveMediaPermissions) {
      window.log.info('Permissions were denied, new call not allowed.');
      return;
    }

    // We could make this faster by getting the call object
    // from the RingRTC before we lookup the ICE servers.
    const call = RingRTC.startOutgoingCall(
      remoteUserId,
      isVideoCall,
      this.localDeviceId,
      await this.getCallSettings(conversation)
    );

    RingRTC.setOutgoingAudio(call.callId, true);
    RingRTC.setVideoCapturer(call.callId, this.videoCapturer);
    RingRTC.setVideoRenderer(call.callId, this.videoRenderer);
    this.attachToCall(conversation, call);

    await this.startDeviceReselectionTimer();

    this.uxActions.outgoingCall({
      callDetails: this.getUxCallDetails(conversation, call),
    });


  }

  async accept(callId: CallId, asVideoCall: boolean) {
    const haveMediaPermissions = await this.requestPermissions(asVideoCall);
    if (haveMediaPermissions) {
      await this.startDeviceReselectionTimer();
      RingRTC.setVideoCapturer(callId, this.videoCapturer);
      RingRTC.setVideoRenderer(callId, this.videoRenderer);
      RingRTC.accept(callId, asVideoCall);
    
    } else {
      window.log.info('Permissions were denied, call not allowed, hanging up.');
      RingRTC.hangup(callId);
    }
  }

  decline(callId: CallId) {
    RingRTC.decline(callId);
  }

  hangup(callId: CallId) {
    RingRTC.hangup(callId);
  }

  setOutgoingAudio(callId: CallId, enabled: boolean) {
    RingRTC.setOutgoingAudio(callId, enabled);
  }

  setOutgoingVideo(callId: CallId, enabled: boolean) {
    RingRTC.setOutgoingVideo(callId, enabled);
  }

  setVideoCapturer(callId: CallId, capturer: VideoCapturer | null) {
    RingRTC.setVideoCapturer(callId, capturer);
  }

  setVideoRenderer(callId: CallId, renderer: VideoRenderer | null) {
    RingRTC.setVideoRenderer(callId, renderer);
  }

  // async protoToCallingMessage({
  //   offer,
  //   answer,
  //   iceCandidates,
  //   legacyHangup,
  //   busy,
  //   hangup,
  //   supportsMultiRing,
  //   destinationDeviceId,
  //   opaque,
  // }: any) {
  //   return {
  //     offer: offer
  //       ? {
  //           ...shallowDropNull(offer),
  
  //           type: dropNull(offer.type) as number,
  //           opaque: offer.opaque ? Buffer.from(offer.opaque) : undefined,
  //         }
  //       : undefined,
  //     answer: answer
  //       ? {
  //           ...shallowDropNull(answer),
  //           opaque: answer.opaque ? Buffer.from(answer.opaque) : undefined,
  //         }
  //       : undefined,
  //     iceCandidates: iceCandidates
  //       ? iceCandidates.map((candidate: { opaque: ArrayBuffer | SharedArrayBuffer; }) => {
  //           return {
  //             ...shallowDropNull(candidate),
  //             opaque: candidate.opaque
  //               ? Buffer.from(candidate.opaque)
  //               : undefined,
  //           };
  //         })
  //       : undefined,
  //     legacyHangup: legacyHangup
  //       ? {
  //           ...shallowDropNull(legacyHangup),
  //           type: dropNull(legacyHangup.type) as number,
  //         }
  //       : undefined,
  //     busy: shallowDropNull(busy),
  //     hangup: hangup
  //       ? {
  //           ...shallowDropNull(hangup),
  //           type: dropNull(hangup.type) as number,
  //         }
  //       : undefined,
  //     supportsMultiRing: dropNull(supportsMultiRing),
  //     destinationDeviceId: dropNull(destinationDeviceId),
  //     opaque: opaque
  //       ? {
  //           data: opaque.data ? Buffer.from(opaque.data) : undefined,
  //         }
  //       : undefined,
  //   };
  // }
  


  async handleCallingMessage(
    envelope: EnvelopeClass,
    callingMessage: CallingMessageClass
  ) {
    const enableIncomingCalls = await window.getIncomingCallNotification();
    window.log.info('handleCallingMessage Outside if condition enableIncomingCalls printed...',enableIncomingCalls);
    window.log.info('offer callId print:--',callingMessage.offer?.callId)
    window.log.info('offer sdp print:--',callingMessage.offer?.sdp)
    window.log.info('offer type print:--',callingMessage.offer?.type)

    if (callingMessage.offer && !enableIncomingCalls) {
      // Drop offers silently if incoming call notifications are disabled.
      window.log.info('handleCallingMessage inside if condition printed...');
      window.log.info('Incoming calls are disabled, ignoring call offer.');
      return;
    }

    const remoteUserId = envelope.source || envelope.sourceUuid;
    const remoteDeviceId = this.parseDeviceId(envelope.sourceDevice);
    if (!remoteUserId || !remoteDeviceId || !this.localDeviceId) {
      window.log.error('Missing identifier, ignoring call message.');
      return;
    }

    const messageAgeSec = envelope.messageAgeSec ? envelope.messageAgeSec : 0;
    window.log.info('messageAgeSec print:--',messageAgeSec)
    window.log.info('remoteUserId print:--',remoteUserId)
    window.log.info('remoteDeviceId print:--',remoteDeviceId)
    window.log.info('localDeviceId print:--',this.localDeviceId)
    window.log.info('callingMessage print:--',callingMessage)

    // RingRTC.handleCallingMessage(
    //   remoteUserId,
    //   remoteDeviceId,
    //   this.localDeviceId,
    //   messageAgeSec,
    //   callingMessage
    // );
    // const sourceUuid = envelope.sourceUuid
    // ? uuidToArrayBuffer(envelope.sourceUuid)
    // : null;


    const senderIdentityRecord = window.textsecure.storage.protocol.getIdentityRecord(
      remoteUserId
    );
    if (!senderIdentityRecord) {
      window.log.error(
        'Missing sender identity record; ignoring call message.'
      );
      return;
    }
    const senderIdentityKey = senderIdentityRecord.publicKey.slice(1); // Ignore the type header, it is not used.

    const ourIdentifier =
      window.textsecure.storage.user.getUuid() ||
      window.textsecure.storage.user.getNumber();
    // assert(ourIdentifier, 'We should have either uuid or number');

    const receiverIdentityRecord = window.textsecure.storage.protocol.getIdentityRecord(
      ourIdentifier
    );
    if (!receiverIdentityRecord) {
      window.log.error(
        'Missing receiver identity record; ignoring call message.'
      );
      return;
    }
    const receiverIdentityKey = receiverIdentityRecord.publicKey.slice(1); // Ignore the type header, it is not used.


    // RingRTC.handleCallingMessage(
    //   remoteUserId,
    //   remoteDeviceId,
    //   this.localDeviceId,
    //   messageAgeSec,
    //   await this.protoToCallingMessage(callingMessage),
    //   Buffer.from(senderIdentityKey),
    //   Buffer.from(receiverIdentityKey)
    // );
    RingRTC.handleCallingMessage(
      remoteUserId,
      remoteDeviceId,
      this.localDeviceId,
      messageAgeSec,
      callingMessage,
      senderIdentityKey,
      receiverIdentityKey
    );

  }

  private async requestCameraPermissions(): Promise<boolean> {
    const cameraPermission = await window.getMediaCameraPermissions();
    if (!cameraPermission) {
      await window.showCallingPermissionsPopup(true);

      // Check the setting again (from the source of truth).
      return window.getMediaCameraPermissions();
    }

    return true;
  }

  private async requestMicrophonePermissions(): Promise<boolean> {
    const microphonePermission = await window.getMediaPermissions();
    if (!microphonePermission) {
      await window.showCallingPermissionsPopup(false);

      // Check the setting again (from the source of truth).
      return window.getMediaPermissions();
    }

    return true;
  }

  private async requestPermissions(isVideoCall: boolean): Promise<boolean> {
    const microphonePermission = await this.requestMicrophonePermissions();
    if (microphonePermission) {
      if (isVideoCall) {
        return this.requestCameraPermissions();
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  private async handleOutgoingSignaling(
    remoteUserId: UserId,
    message: CallingMessageClass
  ): Promise<boolean> {
    const conversation = window.ConversationController.get(remoteUserId);
    const sendOptions = conversation
      ? conversation.getSendOptions()
      : undefined;

    if (!window.textsecure.messaging) {
      window.log.warn('handleOutgoingSignaling() returning false; offline');
      return false;
    }

    try {
      await window.textsecure.messaging.sendCallingMessage(
        remoteUserId,
        message,
        sendOptions
      );

      window.log.info('handleOutgoingSignaling() completed successfully');
      return true;
    } catch (err) {
      if (err && err.errors && err.errors.length > 0) {
        window.log.error(
          `handleOutgoingSignaling() failed: ${err.errors[0].reason}`
        );
      } else {
        window.log.error('handleOutgoingSignaling() failed');
      }
      return false;
    }
  }

  // If we return null here, we hang up the call.
  private async handleIncomingCall(call: Call): Promise<CallSettings | null> {
    if (!this.uxActions || !this.localDeviceId) {
      window.log.error('Missing required objects, ignoring incoming call.');
      return null;
    }

    const conversation = window.ConversationController.get(call.remoteUserId);
    if (!conversation) {
      window.log.error('Missing conversation, ignoring incoming call.');
      return null;
    }

    try {
      // The peer must be 'trusted' before accepting a call from them.
      // This is mostly the safety number check, unverified meaning that they were
      // verified before but now they are not.
      const verifiedEnum = await conversation.safeGetVerified();
      if (
        verifiedEnum ===
        window.textsecure.storage.protocol.VerifiedStatus.UNVERIFIED
      ) {
        window.log.info(
          `Peer is not trusted, ignoring incoming call for conversation: ${conversation.idForLogging()}`
        );
        this.addCallHistoryForFailedIncomingCall(conversation, call);
        return null;
      }

      // Simple Call Requests: Ensure that the conversation is accepted.
      // If not, do not allow the call.
      if (!conversation.getAccepted()) {
        window.log.info(
          `Messaging is not accepted, ignoring incoming call for conversation: ${conversation.idForLogging()}`
        );
        this.addCallHistoryForFailedIncomingCall(conversation, call);
        return null;
      }

      this.attachToCall(conversation, call);

      this.uxActions.incomingCall({
        callDetails: this.getUxCallDetails(conversation, call),
      });
      
      return await this.getCallSettings(conversation);
    } catch (err) {
      window.log.error(`Ignoring incoming call: ${err.stack}`);
      this.addCallHistoryForFailedIncomingCall(conversation, call);
      return null;
    }
  }

  private handleAutoEndedIncomingCallRequest(
    remoteUserId: UserId,
    reason: CallEndedReason
  ) {
    const conversation = window.ConversationController.get(remoteUserId);
    if (!conversation) {
      return;
    }
    this.addCallHistoryForAutoEndedIncomingCall(conversation, reason);
  }

  private attachToCall(conversation: ConversationModelType, call: Call): void {
    const { uxActions } = this;
    if (!uxActions) {
      return;
    }

    let acceptedTime: number | undefined;

    call.handleStateChanged = () => {
      if (call.state === CallState.Accepted) {
        acceptedTime = Date.now();
      } else if (call.state === CallState.Ended) {
        this.addCallHistoryForEndedCall(conversation, call, acceptedTime);
      }
      uxActions.callStateChange({
        callState: call.state,
        callDetails: this.getUxCallDetails(conversation, call),
      });
    };

    call.handleRemoteVideoEnabled = () => {
      uxActions.remoteVideoChange({
        remoteVideoEnabled: call.remoteVideoEnabled,
      });
    };
  }

  private async handleLogMessage(
    level: CallLogLevel,
    fileName: string,
    line: number,
    message: string
  ) {
    // info/warn/error are only needed to be logged for now.
    // tslint:disable-next-line switch-default
    switch (level) {
      case CallLogLevel.Info:
        window.log.info(`${fileName}:${line} ${message}`);
        break;
      case CallLogLevel.Warn:
        window.log.warn(`${fileName}:${line} ${message}`);
        break;
      case CallLogLevel.Error:
        window.log.error(`${fileName}:${line} ${message}`);
    }
  }

  private getRemoteUserIdFromConversation(
    conversation: ConversationModelType
  ): UserId | undefined {
    const recipients = conversation.getRecipients();
    if (recipients.length !== 1) {
      return undefined;
    }
    return recipients[0];
  }

  private get localDeviceId(): DeviceId | null {
    return this.parseDeviceId(window.textsecure.storage.user.getDeviceId());
  }

  private parseDeviceId(
    deviceId: number | string | undefined
  ): DeviceId | null {
    if (typeof deviceId === 'string') {
      return parseInt(deviceId, 10);
    }
    if (typeof deviceId === 'number') {
      return deviceId;
    }
    return null;
  }

  // private async getCallSettings(
  //   conversation: ConversationModelType
  // ): Promise<CallSettings> {
  //   if (!window.textsecure.messaging) {
  //     throw new Error('getCallSettings: offline!');
  //   }

  //   const iceServerJson = await window.textsecure.messaging.server.getIceServers();
  //   window.log.info('iceServerJson print:--',JSON.parse(iceServerJson))

  //   const shouldRelayCalls = Boolean(await window.getAlwaysRelayCalls());

  //   // If the peer is 'unknown', i.e. not in the contact list, force IP hiding.
  //   const isContactUnknown = !conversation.isFromOrAddedByTrustedContact();
  //   window.log.info('isContactUnknown print:--',isContactUnknown)

  //   return {
  //     ///iceServer: {username: "kailasshimpi143@gmail.com", password: "admin@123", urls: ["turn:numb.viagenie.ca"]},
  //     iceServer:JSON.parse(iceServerJson),
  //     hideIp: shouldRelayCalls || isContactUnknown,
  //   };
  // }


  private async getCallSettings(
    conversation: ConversationModelType
  ): Promise<CallSettings> {
    if (!window.textsecure.messaging) {
      throw new Error('getCallSettings: offline!');
    }

    const iceServerJson = await window.textsecure.messaging.server.getIceServers();

    const shouldRelayCalls = Boolean(await window.getAlwaysRelayCalls());

    // If the peer is 'unknown', i.e. not in the contact list, force IP hiding.
    const isContactUnknown = !conversation.isFromOrAddedByTrustedContact();

    return {
      iceServer: JSON.parse(iceServerJson),
      hideIp: shouldRelayCalls || isContactUnknown,
      // bandwidthMode: BandwidthMode.Normal,
    };
  }

  private getUxCallDetails(
    conversation: ConversationModelType,
    call: Call
  ): CallDetailsType {
    return {
      ...conversation.cachedProps,

      callId: call.callId,
      isIncoming: call.isIncoming,
      isVideoCall: call.isVideoCall,
    };
  }

  private addCallHistoryForEndedCall(
    conversation: ConversationModelType,
    call: Call,
    acceptedTime: number | undefined
  ) {
    const { endedReason, isIncoming } = call;
    const wasAccepted = Boolean(acceptedTime);
    const isOutgoing = !isIncoming;
    const wasDeclined =
      !wasAccepted &&
      (endedReason === CallEndedReason.Declined ||
        endedReason === CallEndedReason.DeclinedOnAnotherDevice ||
        (isIncoming && endedReason === CallEndedReason.LocalHangup) ||
        (isOutgoing && endedReason === CallEndedReason.RemoteHangup) ||
        (isOutgoing &&
          endedReason === CallEndedReason.RemoteHangupNeedPermission));
    if (call.endedReason === CallEndedReason.AcceptedOnAnotherDevice) {
      // tslint:disable-next-line no-parameter-reassignment
      acceptedTime = Date.now();
    }

    const callHistoryDetails: CallHistoryDetailsType = {
      wasIncoming: call.isIncoming,
      wasVideoCall: call.isVideoCall,
      wasDeclined,
      acceptedTime,
      endedTime: Date.now(),
    };
    conversation.addCallHistory(callHistoryDetails);
  }

  private addCallHistoryForFailedIncomingCall(
    conversation: ConversationModelType,
    call: Call
  ) {
    const callHistoryDetails: CallHistoryDetailsType = {
      wasIncoming: true,
      wasVideoCall: call.isVideoCall,
      // Since the user didn't decline, make sure it shows up as a missed call instead
      wasDeclined: false,
      acceptedTime: undefined,
      endedTime: Date.now(),
    };
    conversation.addCallHistory(callHistoryDetails);
  }

  private addCallHistoryForAutoEndedIncomingCall(
    conversation: ConversationModelType,
    _reason: CallEndedReason
  ) {
    const callHistoryDetails: CallHistoryDetailsType = {
      wasIncoming: true,
      // We don't actually know, but it doesn't seem that important in this case,
      // but we could maybe plumb this info through RingRTC
      wasVideoCall: false,
      // Since the user didn't decline, make sure it shows up as a missed call instead
      wasDeclined: false,
      acceptedTime: undefined,
      endedTime: Date.now(),
    };
    conversation.addCallHistory(callHistoryDetails);
  }
}

export const calling = new CallingClass();
