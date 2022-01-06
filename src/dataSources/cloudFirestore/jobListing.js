import debug from 'debug';
import { utility } from '@thatconference/api';

const { entityDateForge, partners: partnerDateForge } =
  utility.firestoreDateForge;
const jobDateForge = entityDateForge({ fields: ['datePosted'] });

const dlog = debug('that:api:partners:dataSources:firebase:jobListings');

function jobListings(dbInstance) {
  dlog('instance created');

  const collectionName = 'partners';
  const subCollectionName = 'jobListings';

  function scrubJob(job) {
    const scrubbedJob = job;
    // rewrite urls to hrefs
    Object.keys(scrubbedJob).forEach(key => {
      const value = scrubbedJob[key];
      if (value instanceof URL) scrubbedJob[key] = value.toString();
    });

    if (!scrubbedJob.datePosted) scrubbedJob.datePosted = new Date();

    return job;
  }

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

    return jobDateForge(results);
  }

  async function findPartners(partnerId, isFeatured) {
    dlog('findPartners');
    let colSnapshot;

    if (isFeatured) {
      colSnapshot = dbInstance
        .doc(`${collectionName}/${partnerId}`)
        .collection(subCollectionName)
        .where('featured', '==', isFeatured);
    } else {
      colSnapshot = dbInstance
        .doc(`${collectionName}/${partnerId}`)
        .collection(subCollectionName);
    }

    const { docs } = await colSnapshot.get();

    const results = docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    return partnerDateForge(results);
  }

  function get(partnerId, jobListingId) {
    dlog('get job %s for partner %s', partnerId, jobListingId);
    const docRef = dbInstance
      .collection(collectionName)
      .doc(partnerId)
      .collection(subCollectionName)
      .doc(jobListingId);

    return docRef.get().then(docSnap => {
      let result = null;
      if (docSnap.exists) {
        result = {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }

      return jobDateForge(result);
    });
  }

  async function add(partnerId, jobListing) {
    dlog('add job to partner %s', partnerId);

    scrubJob(jobListing);
    const ref = dbInstance
      .doc(`${collectionName}/${partnerId}`)
      .collection(subCollectionName);

    const results = await ref.add(jobListing);

    return get(partnerId, results.id);
  }

  function update(partnerId, jobListingId, jobListing) {
    dlog('update');

    scrubJob(jobListing);
    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${jobListingId}`,
    );

    return documentRef
      .update(jobListing)
      .then(() => get(partnerId, jobListingId));
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
