import debug from 'debug';

const dlog = debug('that:api:partners:dataSources:firebase:jobListings');

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

  async function findBySlug(id, slug) {
    dlog('findBySlug');

    const colSnapshot = dbInstance
      .doc(`${collectionName}/${id}`)
      .collection(subCollectionName)
      .where('slug', '==', slug.toLowerCase());

    const { size, docs } = await colSnapshot.get();

    let result = null;

    if (size === 1) {
      dlog('1');
      const [d] = docs;

      result = {
        id: d.id,
        ...d.data(),
      };
    } else if (size > 1) {
      throw new Error(`Multiple Job Listings Slugs Found for ${slug}`);
    }

    return result;
  }

  return { add, update, remove, findAll, findPartners, findBySlug };
}

export default jobListings;
