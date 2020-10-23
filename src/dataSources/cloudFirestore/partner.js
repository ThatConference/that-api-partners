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
    if (scrubbedPartner.slug && !isSlugTaken(scrubbedPartner.slug))
      throw new Error('Slug in use, cannot be used to create a new partner');

    const partnerDocRef = partnerCollection.doc();
    const slugDoc = slugStore(dbInstance).makeSlugDoc({
      slugName: scrubbedPartner.slug,
      type: 'partner',
      referenceId: partnerDocRef,
    });
    const slugDocRef = slugStore(dbInstance).getSlugDocRef(
      scrubbedPartner.slug,
    );

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
          'failed batch write member profile and slug',
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
      ...scrubPartner,
    };

    return partnerDateForge(out);
  }

  async function createLocal(newPartner) {
    const scrubbedPartner = newPartner;

    const newDocument = await partnerCollection.add(scrubbedPartner);

    return {
      id: newDocument.id,
      ...scrubbedPartner,
    };
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

  async function getAll() {
    const { docs } = await partnerCollection.get();

    return docs.map(d => {
      const result = {
        id: d.id,
        ...d.data(),
      };
      return partnerDateForge(result);
    });
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

  return {
    create,
    get,
    findBySlug,
    getAll,
    getBatch,
    update,
    findIdFromSlug,
    getSlug,
  };
};

export default partner;
