import debug from 'debug';
import { sortBy } from 'lodash';
import envConfig from '../../envConfig';

const dlog = debug('that:api:partners:dataSources:firebase:eventPartners');

function eventParnters(dbInstance) {
  dlog('eventPartners instance created');

  const collectionName = 'events';
  const subCollectionName = 'partners';

  const levelSortOrder = [
    'PIONEER',
    'EXPLORER',
    'SCOUT',
    'CUB',
    'PATRON',
    'CORPORATE_PARTNER',
    'PARTNER',
    'PLATINUM',
    'GOLD',
    'SILVER',
    'BRONZE',
    'MEDIA',
  ];

  // Active partners are those who sponsor an event and the event is
  // not more than x days past
  async function findActivePartners(communitySlug) {
    const xmsAfter = envConfig.activePartnerDays * 86400000;
    const eventActiveDate = new Date(new Date().getTime() + xmsAfter);
    dlog('End Date up to %s', eventActiveDate);
    const { docs: activeEvents } = await dbInstance
      .collection(collectionName)
      .where('community', '==', communitySlug)
      .where('endDate', '>=', eventActiveDate)
      .orderBy('endDate', 'asc')
      .get();

    // activeEvents.forEach(({ id }) => dlog('+!!+ %s', id));
    dlog('Active event count: %d', activeEvents.length);
    // setup functions for each active event to get partners
    const getPartnerFuncs = activeEvents.map(({ id: eventId }) =>
      dbInstance
        .collection(collectionName)
        .doc(eventId)
        .collection(subCollectionName)
        .get()
        .then(({ docs }) => docs.map(d => ({ id: d.id, ...d.data() }))),
    );

    const partnerResults = await Promise.all(getPartnerFuncs);
    // deduplicate partners earlier older to new events (set by event query)
    const activePartners = new Map();
    partnerResults.forEach(p1 =>
      p1.forEach(pp => {
        if (!activePartners.has(pp.id)) {
          activePartners.set(pp.id, pp);
        }
      }),
    );

    // sort partners by level and placement (e.g. 'PIONEER', 1)
    const inOrder = sortBy(
      [...activePartners.values()],
      [item => levelSortOrder.indexOf(item.level), 'placement'],
    );
    dlog('Active Partner count returned: %d', inOrder.length);

    return inOrder.map(p => p.id);
  }

  return { findActivePartners };
}

export default eventParnters;
