import { EventEmitter } from 'events';
import debug from 'debug';
import * as Sentry from '@sentry/node';
import { dataSources } from '@thatconference/api';
import { SendEmailError } from '../lib/errors';
import partnerStore from '../dataSources/cloudFirestore/partner';
import partnerMemberStore from '../dataSources/cloudFirestore/members';
import sharedProfileStore from '../dataSources/cloudFirestore/sharedProfile';
import envConfig from '../envConfig';

const dlog = debug('that:api:partners:events:user');
const memberStore = dataSources.cloudFirestore.member;

function userEvents(postmark) {
  const userEventEmitter = new EventEmitter();
  dlog('user Event Emitter created');
  Sentry.addBreadcrumb({
    category: 'events',
    message: 'entered user event emitter in partners api',
    level: Sentry.Severity.Info,
  });

  async function getEmailData({ firestore, lead }) {
    let partner = null;
    let memberLead = null;
    let partnerContact = null;
    const pmFuncs = [
      partnerStore(firestore).get(lead.partnerId),
      sharedProfileStore(firestore).get(lead.memberId),
    ];
    if (lead.partnerContactId)
      pmFuncs.push(sharedProfileStore(firestore).get(lead.partnerContactId));
    else pmFuncs.push(false);
    try {
      [partner, memberLead, partnerContact] = await Promise.all(pmFuncs);
    } catch (err) {
      return process.nextTick(() =>
        userEventEmitter.emit('eventEmitterUserError', err),
      );
    }

    // THAT Profile functions
    const tpFuncs = [];
    if (!memberLead || (!partnerContact && partnerContact !== false)) {
      if (memberLead) tpFuncs.push(memberLead);
      else tpFuncs.push(memberStore(firestore).get(lead.memberId));
      if (partnerContact) tpFuncs.push(partnerContact);
      else tpFuncs.push(memberStore(firestore).get(lead.partnerContactId));
      try {
        [memberLead, partnerContact] = await Promise.all(tpFuncs);
      } catch (err) {
        return process.nextTick(() =>
          userEventEmitter.emit('eventEmitterUserError', err),
        );
      }
    }

    if (!partner || !memberLead || (partnerContact && !partnerContact.email)) {
      dlog('Failed to retreave partner or member data');
      Sentry.withScope(scope => {
        scope.setLevel(Sentry.Severity.Error);
        scope.setContext('partner', partner);
        scope.setContext('memberLead', memberLead);
        scope.setContext('partnerContact', partnerContact);
        scope.setContext('lead', lead);
        scope.setTag('message', 'partner-generated-lead');
        Sentry.captureMessage('Failed to retreave partner or member data');
      });
      return undefined;
    }

    return { partner, memberLead, partnerContact };
  }

  // Email sent when a member adds themselves as a lead
  async function sendMemberGenLeadEmail({ firestore, event, lead }) {
    dlog('sendMemberGenEmail, %o', lead);
    const templateAlias = 'lead-member-generated';

    // we need partner primary contact
    let primaryContact;
    try {
      [primaryContact] = await partnerMemberStore(
        firestore,
      ).findIsPrimaryContact(lead.partnerId);
    } catch (err) {
      return process.nextTick(() =>
        userEventEmitter.emit('eventEmitterUserError', err),
      );
    }
    // eslint-disable-next-line no-param-reassign
    if (primaryContact?.id) lead.partnerContactId = primaryContact.id;

    const { partner, memberLead, partnerContact } = await getEmailData({
      firestore,
      lead,
    });
    if (!partner || !memberLead) return undefined;

    if (!partnerContact?.email) {
      Sentry.withScope(scope => {
        scope.setLevel(Sentry.Severity.Error);
        scope.setContext('partner', partner);
        scope.setContext('memberLead', memberLead);
        scope.setContext('partnerContact', partnerContact);
        scope.setContext('lead', lead);
        scope.setTag('message', 'member-generated-lead');
        Sentry.captureMessage(
          'No partner contact email returned. cannot send email.',
        );
      });
      dlog('No partner contact email returned. cannot send email.');
      return undefined;
    }
    dlog(`let's send this email`);
    return postmark.sendEmailWithTemplate({
      templateAlias,
      from: envConfig.notificationEmailFrom,
      to: partnerContact.email,
      cc: memberLead.email,
      templateModel: {
        event: {
          name: event.name,
        },
        partner: {
          companyName: partner.companyName,
          showcaseUrl: `https://that.us/partners/${partner.slug}`,
          callToAction: partner.callToAction,
          callToActionUrl: partner.callToActionUrl || '',
          contactName: partnerContact.firstName
            ? `${partnerContact.firstName} ${partnerContact.lastName}`
            : '',
          memberName: `${memberLead.firstName} ${memberLead.lastName}`,
        },
      },
    });
  }

  async function sendPartnerGenLeadEmail({ firestore, event, lead }) {
    dlog('sendPartnerGenEmail, %o', lead);
    const templateAlias = 'lead-partner-generated';
    if (!lead.partnerContactId) {
      Sentry.withScope(scope => {
        scope.setLevel(Sentry.Severity.Warning);
        scope.setTag('event', 'user');
        scope.setContext('lead', lead);
        Sentry.captureMessage(
          'partnerContactId not received from partner generated lead',
        );
      });
      // We'll still send email as the to is the member
    }

    const { partner, memberLead, partnerContact } = await getEmailData({
      firestore,
      lead,
    });
    if (!partner || !memberLead) return undefined;

    dlog(`let's send this email`);
    return postmark.sendEmailWithTemplate({
      templateAlias,
      from: envConfig.notificationEmailFrom,
      to: memberLead.email,
      cc: partnerContact.email || '',
      templateModel: {
        event: {
          name: event.name,
        },
        partner: {
          companyName: partner.companyName,
          name: partner.companyName,
          showcaseUrl: `https://that.us/partners/${partner.slug}`,
          callToAction: partner.callToAction,
          callToActionUrl: partner.callToActionUrl || '',
          contactName: partnerContact.firstName
            ? `${partnerContact.firstName} ${partnerContact.lastName}`
            : '',
          memberName: `${memberLead.firstName} ${memberLead.lastName}`,
          partnerPin: lead.partnerPin,
        },
      },
    });
  }

  userEventEmitter.on('eventEmitterUserError', err => {
    Sentry.captureException(err);
    throw new SendEmailError(err.message);
  });

  userEventEmitter.on('partnerGenLeadCreated', sendPartnerGenLeadEmail);
  userEventEmitter.on('memberGenLeadCreated', sendMemberGenLeadEmail);

  return userEventEmitter;
}

export default userEvents;
