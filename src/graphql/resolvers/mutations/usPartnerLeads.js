import debug from 'debug';
import { dataSources } from '@thatconference/api';
import orderStore from '../../../dataSources/cloudFirestore/orders';
import leadStore from '../../../dataSources/cloudFirestore/leads';

const eventStore = dataSources.cloudFirestore.event;
const dlog = debug('that:api:partners:mutations:us:leads');

export const fieldResolvers = {
  UsPartnerLeadsMutation: {
    add: async (
      { partnerId, slug },
      { lead: leadInput },
      {
        dataSources: {
          firestore,
          events: { userEvents },
        },
        user,
      },
    ) => {
      const { partnerPin, eventId, partnersNotes = null } = leadInput;
      dlog('add lead %s on partner %s', partnerPin, slug);
      const result = {
        result: false,
        message: 'not set',
      };
      const [[allocation], event] = await Promise.all([
        orderStore(firestore).findPin({
          partnerPin,
          eventId,
        }),
        eventStore(firestore).get(eventId),
      ]);
      if (!event) throw new Error(`Invalid event provided.`);
      dlog('the allocation: %o', allocation);
      if (!allocation) result.message = `PIN entered not found.`;
      else if (!allocation.allocatedTo)
        result.message = `PIN found but not set to a member.`;
      else {
        result.result = true;
        result.message = `Lead saved.`;
      }

      if (result.result === false) return result;

      const lead = {
        partnerId,
        eventId,
        memberId: allocation.allocatedTo,
        partnerContactId: user.sub,
        partnersNotes,
        partnerPin,
      };
      const newLead = await leadStore(firestore).create({
        newLead: lead,
        user,
      });

      result.partnerLeadView = newLead;
      userEvents.emit('partnerGenLeadCreated', {
        event,
        lead,
        firestore,
      });

      return result;
    },
  },
};
