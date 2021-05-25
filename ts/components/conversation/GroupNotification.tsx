import React from 'react';
import { compact, flatten } from 'lodash';

import { ContactName } from './ContactName';
import { Intl } from '../Intl';
import { LocalizerType } from '../../types/Util';

import { missingCaseError } from '../../util/missingCaseError';

interface Contact {
  phoneNumber?: string;
  profileName?: string;
  name?: string;
  title: string;
  isMe?: boolean;
}

interface Change {
  type: 'add' | 'remove' | 'name' | 'avatar' | 'general' | 'memberRemove';
  newName?: string;
  contacts?: Array<Contact>;
}

export type PropsData = {
  from: Contact;
  changes: Array<Change>;
};

type PropsHousekeeping = {
  i18n: LocalizerType;
};

export type Props = PropsData & PropsHousekeeping;

export class GroupNotification extends React.Component<Props> {
  public renderChange(change: Change, from: Contact) {
    const { contacts, type, newName } = change;
    const { i18n } = this.props;

    const otherPeople: Array<JSX.Element> = compact(
      (contacts || []).map(contact => {
        if (contact.isMe) {
          return null;
        }

        return (
          <span
            key={`external-${contact.phoneNumber}`}
            className="module-group-notification__contact"
          >
            <ContactName
              title={contact.title}
              phoneNumber={contact.phoneNumber}
              profileName={contact.profileName}
              name={contact.name}
              i18n={i18n}
            />
          </span>
        );
      })
    );
    const otherPeopleWithCommas: Array<JSX.Element | string> = compact(
      flatten(
        otherPeople.map((person, index) => [index > 0 ? ', ' : null, person])
      )
    );
    const contactsIncludesMe = (contacts || []).length !== otherPeople.length;
    /*  const peopleAfterRemove: Array<JSX.Element> = compact(
       (contacts || []).map(contact => {
         const removContact=change.contacts?change.contacts[0]:null ;
         window.log.info("change.contacts print in peopleAfterRemove method:-",change.contacts);
         window.log.info("removContact print in peopleAfterRemove method:-",removContact);
 
         if (removContact==null) {
           return null;
         }
 
         return (
           <span
             key={`external-${contact.phoneNumber}`}
             className="module-group-notification__contact"
           >
             <ContactName
               title={contact.title}
               phoneNumber={contact.phoneNumber}
               profileName={contact.profileName}
               name={contact.name}
               i18n={i18n}
             />
           </span>
         );
       })
     );
     const peopleAfterRemoveWithCommas: Array<JSX.Element | string> = compact(
       flatten(
         peopleAfterRemove.map((person, index) => [index > 0 ? ', ' : null, person])
       )
     );
  */


    switch (type) {
      case 'name':
        return (
          <Intl i18n={i18n} id="titleIsNow" components={[newName || '']} />
        );
      case 'avatar':
        return <Intl i18n={i18n} id="updatedGroupAvatar" />;
      case 'add':
        if (!contacts || !contacts.length) {
          throw new Error('Group update is missing contacts');
        }

        const otherPeopleNotifMsg =
          otherPeople.length === 1
            ? 'joinedTheGroup'
            : 'multipleJoinedTheGroup';

        return (
          <>
            {otherPeople.length > 0 && (
              <Intl
                i18n={i18n}
                id={otherPeopleNotifMsg}
                components={[otherPeopleWithCommas]}
              />
            )}
            {contactsIncludesMe && (
              <div className="module-group-notification__change">
                <Intl i18n={i18n} id="youJoinedTheGroup" />
              </div>
            )}
          </>
        );
      case 'remove':
        if (from && from.isMe) {
          return i18n('youLeftTheGroup');
        }
        if (!contacts || !contacts.length) {
          throw new Error('Group update is missing contacts');
        }
        const leftKey =
          contacts.length > 1 ? 'multipleLeftTheGroup' : 'leftTheGroup';
       return (
          <Intl i18n={i18n} id={leftKey} components={[otherPeopleWithCommas]} />
        );

      case 'memberRemove':
        if (from && from.isMe) {
          const rname = contacts ? contacts[0].name : null;
           return i18n('youRemovedMemberFromTheGroup', [rname!]);
        }
        if (!contacts || !contacts.length) {
          throw new Error('Group update is missing contacts');
        }
        // const removeKey = contacts.length > 1 ? 'youRemovedFromTheGroup' : 'null';
        // return (<Intl i18n={i18n} id={removeKey} components={[peopleAfterRemoveWithCommas]} /> );
        return (null);
      case 'general':
        return;
      default:
        throw missingCaseError(type);
    }
  }

  public render() {
    const { changes, i18n, from } = this.props;

    // Leave messages are always from the person leaving, so we omit the fromLabel if
    //   the change is a 'leave.'
    const isLeftOnly =
      changes && changes.length === 1 && changes[0].type === 'remove';

    const isRemoveOnly =
      changes && changes.length === 1 && changes[0].type === 'memberRemove';


    const fromContact = (
      <ContactName
        title={from.title}
        phoneNumber={from.phoneNumber}
        profileName={from.profileName}
        name={from.name}
        i18n={i18n}
      />
    );
    const removemember = changes[0].contacts ? changes[0].contacts[0] : null;
    var removedContact;
    if (removemember !== null) {
      removedContact = (
        <ContactName
          title={removemember.title}
          phoneNumber={removemember.phoneNumber}
          profileName={removemember.profileName}
          name={removemember.name}
          i18n={i18n}
        />);
    }
    else {
      removedContact = (
        <ContactName
          title={""}
          phoneNumber={""}
          profileName={""}
          name={""}
          i18n={i18n}
        />);
    }
    //const fromLabel = (from.isMe && isRemoveOnly) ? ( <Intl i18n={i18n} id="youRemovedMemberFromTheGroup" components={[removedContact]} />) :
    const fromLabel = (!from.isMe && isRemoveOnly && !removemember?.isMe) ? (<Intl i18n={i18n} id="removedMemberFromTheGroup" components={{ name: fromContact, removedName: removedContact }} />) :
      (!from.isMe && isRemoveOnly && removemember?.isMe) ? (<Intl i18n={i18n} id="youRemovedFromTheGroup" components={[fromContact]} />) :
        (from.isMe && !isRemoveOnly) ? (<Intl i18n={i18n} id="youUpdatedTheGroup" />) :
          (!from.isMe && !isRemoveOnly) ? (<Intl i18n={i18n} id="updatedTheGroup" components={[fromContact]} />) : null;
    return (
      <div className="module-group-notification">
        {isLeftOnly ? null : (
          <>
            {fromLabel}
            <br />
          </>
        )}
        {(changes || []).map((change, index) => (
          <div key={index} className="module-group-notification__change">
            {this.renderChange(change, from)}
          </div>
        ))}
      </div>
    );
  }
}
