// Copyright 2020-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
// import classNames from 'classnames';
import { LocalizerType } from '../types/Util';
import { Tooltip } from './Tooltip';
import { Theme } from '../util/theme';

export type PropsType = {
  canPip?: boolean;
  i18n: LocalizerType;
  // isInSpeakerView?: boolean;
  isGroupCall?: boolean;
  message?: any;
  // participantCount: number;
  // showParticipantsList: boolean;
  title?: string;
  // toggleParticipants?: () => void;
  // togglePip?: () => void;
  toggleSettings: () => void;
  // toggleSpeakerView?: () => void;
};

export const CallingHeader = ({
  // canPip = false,
  // i18n,
  // isInSpeakerView,
  // isGroupCall = false,
  message,
  // participantCount,
  // showParticipantsList,
  title,
  // toggleParticipants,
  // togglePip,
  toggleSettings,
  // toggleSpeakerView,
}: PropsType): JSX.Element => (
  <div className="module-calling__header">
    {title ? (
      <div className="module-calling__header--header-name">{title}</div>
    ) : null}
    {message ? (
      <div className="module-ongoing-call__header-message">{message}</div>
    ) : null}
    <div className="module-calling-tools">
      <div className="module-calling-tools__button">
        <Tooltip
          content="Settings"
          theme={Theme.Dark}
        >
          <button
            aria-label="Settings"
            className="module-calling-button__settings"
            onClick={toggleSettings}
            type="button"
          />
        </Tooltip>
      </div>
    </div>


  </div>
);
