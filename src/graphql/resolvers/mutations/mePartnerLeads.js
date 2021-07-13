import debug from 'debug';
import { dataSources } from '@thatconference/api';
import leadStore from '../../../dataSources/cloudFirestore/leads';

const eventStore = dataSources.cloudFirestore.event;
const dlog = debug('that:api:partners:mutations:me:leads');

export const fieldResolvers = {
  MePartnerLeadsMutation: {
    add: async (
      { partnerId, slug },
      { lead: leadInput },
      { dataSources: { firestore }, user },
    ) => {
      dlog('add called on partner %s, by member %s', slug, user.sub);
      const { eventId, membersNotes = null } = leadInput;
      const event = await eventStore(firestore).get(eventId);
      if (!event) throw new Error('Invalid event provided');
      const result = {
        result: true,
        message: `Lead saved.`,
      };

      const lead = {
        partnerId,
        eventId,
        memberId: user.sub,
        membersNotes,
        partnerPin: null,
      };
      const newLead = await leadStore(firestore).create({
        newLead: lead,
        user,
      });

      result.memberLeadView = newLead;

      return result;
    },
  },
};
