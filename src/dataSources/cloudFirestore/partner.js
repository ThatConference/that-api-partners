import debug from 'debug';
import * as Sentry from '@sentry/node';
import { dataSources, utility } from '@thatconference/api';

const dlog = debug('that:api:partners:datasources:firebase:partner');
const slugStore = dataSources.cloudFirestore.slug;
const partnerDateForge = utility.firestoreDateForge.partners;

function scrubPartner({ partner, isNew, user }) {
  const scrubbedPartner = partner;

  const modifiedAtDate = new Date();

  if (isNew) {
    scrubbedPartner.createdAt = modifiedAtDate;
  }
  scrubbedPartner.lastUpdatedAt = modifiedAtDate;
  if (user) {
    scrubbedPartner.lastUpdatedBy = user.sub;
  }
  // rewite urls to hrefs
  Object.keys(scrubbedPartner).forEach(key => {
    const value = scrubbedPartner[key];
    if (value instanceof URL) scrubbedPartner[key] = value.toString();
  });

  return scrubbedPartner;
}

const partner = dbInstance => {
  const collectionName = 'partners';
  const partnerCollection = dbInstance.collection(collectionName);

  function isSlugTaken(slug) {
    dlog('isSlugTaken called ', slug);
    return slugStore(dbInstance).isSlugTaken(slug);
  }

  async function create(newPartner, user) {
    dlog('create partner called %o', newPartner);
    const scrubbedPartner = scrubPartner({
      partner: newPartner,
      isNew: true,
      user,
    });
    const newSlug = scrubbedPartner.slug;
    const slugInUse = await isSlugTaken(newSlug);
    if (slugInUse)
      throw new Error('Slug in use, cannot be used to create a new partner');

    const partnerDocRef = partnerCollection.doc(); // creates random id
    dlog('new partner id %s', partnerDocRef.id);
    const slugDoc = slugStore(dbInstance).makeSlugDoc({
      slugName: newSlug,
      type: 'partner',
      referenceId: partnerDocRef.id,
    });
    slugDoc.createdAt = scrubbedPartner.createdAt;
    const slugDocRef = slugStore(dbInstance).getSlugDocRef(newSlug);

    const writeBatch = dbInstance.batch();
    writeBatch.create(partnerDocRef, scrubbedPartner);
    writeBatch.create(slugDocRef, slugDoc);
    let writeResult;
    try {
      writeResult = await writeBatch.commit();
    } catch (err) {
      dlog('failed batch write create partner and slug');
      Sentry.withScope(scope => {
        scope.setLevel('error');
        scope.setContext(
          'failed batch write new partner record',
          { partnerDocRef, scrubbedPartner },
          { slugDocRef, slugDoc },
          { user: user.sub },
        );
        Sentry.captureException(err);
      });
      throw new Error('failed batch write create partner and slug');
    }
    dlog('writeResult %o', writeResult);
    const out = {
      id: partnerDocRef.id,
      ...scrubbedPartner,
    };

    return partnerDateForge(out);
  }

  async function get(id) {
    dlog('get', id);
    const docRef = dbInstance.doc(`${collectionName}/${id}`);
    const doc = await docRef.get();

    let result = null;
    if (doc.exists) {
      result = {
        id: doc.id,
        ...doc.data(),
      };
      result = partnerDateForge(result);
    }

    return result;
  }

  function getBatch(ids) {
    dlog('getting batch of partners for %o', ids);

    return Promise.all(ids.map(id => get(id)));
  }

  async function getAll() {
    dlog('getting all partners');
    const { docs } = await partnerCollection.get();

    return docs.map(d => {
      const result = {
        id: d.id,
        ...d.data(),
      };
      return partnerDateForge(result);
    });
  }

  async function findBySlug(slug) {
    dlog('findBySlug %s', slug);

    const query = partnerCollection.where('slug', '==', slug);
    const { size, docs } = await query.get();

    let result = null;
    if (size === 1) {
      dlog('1');
      const [d] = docs;

      result = {
        id: d.id,
        ...d.data(),
      };
      result = partnerDateForge(result);
    } else if (size > 1) {
      throw new Error(`Multiple partner Slugs Found for ${slug}`);
    }

    return result;
  }

  // https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#update
  function update(id, newPartner, user) {
    dlog('updating id %o', id);
    const scrubbedPartner = scrubPartner({ partner: newPartner, user });
    const docRef = partnerCollection.doc(id);

    return docRef.update(scrubbedPartner).then(() => get(id));
  }

  async function findIdFromSlug(slug) {
    dlog('find id by slug %s', slug);
    const slimslug = slug.trim().toLowerCase();
    const { size, docs } = await partnerCollection
      .where('slug', '==', slimslug)
      .select()
      .get();

    let result = null;
    if (size === 1) {
      const [d] = docs;
      result = {
        id: d.id,
        slug,
      };
    } else if (size > 1) {
      throw new Error(`Multiple partner records found for slug ${slimslug}`);
    }

    dlog('result slug/id %o', result);
    return result;
  }

  async function getSlug(id) {
    dlog('find slug by id %s', id);
    const doc = await partnerCollection.doc(id).get();
    let result = null;
    if (doc.exists) {
      result = {
        id: doc.id,
        slug: doc.get('slug'),
      };
    }

    return result;
  }

  async function changeSlug({ partnerId, newSlug, user }) {
    dlog('changePartnerSlug called for: %s, newSlug: %s', partnerId, newSlug);
    const isNewInUse = await slugStore(dbInstance).isSlugTaken(newSlug);
    if (isNewInUse)
      throw new Error('unable to change partner slug, new slug in use already');
    const partnerDocRef = partnerCollection.doc(partnerId);
    const docSnapshot = await partnerDocRef.get();
    if (!docSnapshot.exists)
      throw new Error(
        'invalid partnerId provided, unable to change partner slug',
      );
    const scrubbedPartner = scrubPartner({
      partner: {
        slug: newSlug,
      },
      user,
    });
    const currentSlug = docSnapshot.get('slug');
    const currentSlugDocRef = slugStore(dbInstance).getSlugDocRef(currentSlug);
    const newSlugDocRef = slugStore(dbInstance).getSlugDocRef(newSlug);
    const newSlugDoc = slugStore(dbInstance).makeSlugDoc({
      slugName: newSlug,
      type: 'partner',
      referenceId: partnerDocRef.id,
    });
    newSlugDoc.createdAt = scrubbedPartner.lastUpdatedAt;

    const writeBatch = dbInstance.batch();
    writeBatch.delete(currentSlugDocRef);
    writeBatch.update(partnerDocRef, scrubbedPartner);
    writeBatch.create(newSlugDocRef, newSlugDoc);
    let writeResult;
    try {
      writeResult = await writeBatch.commit();
    } catch (err) {
      dlog('failed batch write change partner slug');
      Sentry.withScope(scope => {
        scope.setLevel('error');
        scope.setTags({
          memberId: user.sub,
          partnerId: partnerDocRef.id,
          partnerSlug: newSlug,
        });
        scope.setContext('failed batch write change partner slug', {
          scrubPartner,
          newSlugDoc,
        });
        Sentry.captureException(err);
      });
      throw new Error('failed batch write change partner slug');
    }
    dlog('writeResult %o', writeResult);

    return get(partnerDocRef.id);
  }

  return {
    isSlugTaken,
    create,
    update,
    getBatch,
    getAll,
    findBySlug,
    get,
    findIdFromSlug,
    getSlug,
    changeSlug,
  };
};

export default partner;
