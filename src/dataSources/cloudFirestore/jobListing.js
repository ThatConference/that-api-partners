import debug from 'debug';

const dlog = debug('that:api:events:datasources:firebase:joblistings');

function jobListings(dbInstance) {
  dlog('instance created');

  const collectionName = 'partners';
  const subCollectionName = 'jobListings';

  async function findAll() {
    dlog('findAll');
    const colSnapshot = dbInstance
      .collection(collectionName)
      .collectionGroup(subCollectionName);

    const { docs } = await colSnapshot.get();

    const results = docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    return results;
  }

  async function findPartners(partnerId) {
    dlog('findPartners');
    const colSnapshot = dbInstance
      .doc(`${collectionName}/${partnerId}`)
      .collection(subCollectionName);

    const { docs } = await colSnapshot.get();

    const results = docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    return results;
  }

  // todo.. need to check why I used set..
  async function add(partnerId, jobListing) {
    dlog('add');

    const ref = dbInstance
      .doc(`${collectionName}/${partnerId}`)
      .collection(subCollectionName);

    const results = await ref.add(jobListing);

    return {
      id: results.id,
      ...jobListing,
    };
  }

  function update(partnerId, jobListingId, jobListing) {
    dlog('update');

    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${jobListingId}`,
    );

    return documentRef.update(jobListing).then(res => ({
      id: jobListingId,
      ...jobListing,
    }));
  }

  function remove(partnerId, jobListingId) {
    dlog('remove');
    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${jobListingId}`,
    );

    return documentRef.delete().then(res => {
      dlog(`removed event ${partnerId} notification: ${jobListingId}`);
      return jobListingId;
    });
  }

  return { add, update, remove, findAll, findPartners };
}

export default jobListings;
