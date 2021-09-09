// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useState } from 'react';
import moment from 'moment';
import * as packageJson from '../../package.json';
import { Modal } from './Modal';
import { Intl } from './Intl';
import { Emojify } from './conversation/Emojify';
import { LocalizerType } from '../types/Util';

export type PropsType = {
  i18n: LocalizerType;
};

type ReleaseNotesType = {
  date: Date;
  version: string;
  features: Array<string>;
};

export const WhatsNew = ({ i18n }: PropsType): JSX.Element => {
  const [releaseNotes, setReleaseNotes] = useState<
    ReleaseNotesType | undefined
  >();

  const viewReleaseNotes = () => {
    setReleaseNotes({
      date: new Date('09/02/2021'),
      version: packageJson.version,
      features: ['WhatsNew__1', 'WhatsNew__2','WhatsNew__3', 'WhatsNew__4','WhatsNew__5', 'WhatsNew__6'],
    });
  };

  return (
    <>
      {releaseNotes && (
        <Modal
          hasXButton
          i18n={i18n}
          onClose={() => setReleaseNotes(undefined)}
          // title={i18n('WhatsNew__modal-title')}
          title="what's new"
        >
          <>
            <span>
              {moment(releaseNotes.date).format('LL')} &middot;{' '}
              {releaseNotes.version}
            </span>
            <ul>
              {releaseNotes.features.map(featureKey => (
                <li key={featureKey}>
                  <Intl
                    i18n={i18n}
                    id={featureKey}
                    renderText={({ key, text }) => (
                      <Emojify key={key} text={text} />
                    )}
                  />
                </li>
              ))}
            </ul>
          </>
        </Modal>
      )}
      <Intl
        i18n={i18n}
        id="whatsNew"
        components={[
          <button className="WhatsNew" type="button" onClick={viewReleaseNotes}>
            {/* {i18n('viewReleaseNotes')} */}
            what's new
          </button>,
        ]}
      />
    </>
  );
};
