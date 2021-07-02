import debug from 'debug';
import * as Sentry from '@sentry/node';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:partners:datasources:firebase:lead');
const { entityDateForge } = utility.firestoreDateForge;
const fields = ['createdAt', 'lastUpdatedAt'];
const leadDateForge = entityDateForge({ fields });

function scrubLead({ lead, isNew, userId }) {
  const scrubbedLead = lead;
  const modifiedAtDate = new Date();

  if (isNew) {
    scrubbedLead.createdAt = modifiedAtDate;
    scrubbedLead.createdBy = userId;
  }
  scrubbedLead.lastUpdatedAt = modifiedAtDate;
  scrubbedLead.lastUpdatedBy = userId;

  return scrubbedLead;
}

const collectionName = 'leads';

const lead = dbInstance => {
  dlog('lead instance created');
  const leadCollection = dbInstance.collection(collectionName);

  function get(leadId) {
    dlog('get lead %s', leadId);
    return leadCollection
      .doc(leadId)
      .get()
      .then(docRef => {
        let r = null;
        if (docRef.exists) {
          r = {
            id: docRef.id,
            ...docRef.data(),
          };

          r = leadDateForge(r);
        }

        return r;
      });
  }

  function create({ newLead, user }) {
    dlog('create called:: %o', newLead);

    const scrubbedLead = scrubLead({
      lead: newLead,
      isNew: true,
      userId: user.sub,
    });

    return leadCollection
      .add(scrubbedLead)
      .then(newDocRef => get(newDocRef.id));
  }

  function findByPartner(partnerId) {
    dlog('findByPartner %s', partnerId);

    return leadCollection
      .where('partnerId', '==', partnerId)
      .get()
      .then(querySnap =>
        querySnap.docs.map(leads => {
          const r = {
            id: leads.id,
            ...leads.data(),
          };
          return leadDateForge(r);
        }),
      );
  }

  return { get, create, findByPartner };
};

export default lead;
