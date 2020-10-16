import debug from 'debug';

const dlog = debug('that:api:partners:datasources:firebase:partner');

const partner = dbInstance => {
  const collectionName = 'partners';
  const partnerCollection = dbInstance.collection(collectionName);

  async function create(newPartner) {
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
    }

    return result;
  }

  function getbatchByIds(ids) {
    dlog('getting batch of partners for %o', ids);

    return Promise.all(ids.map(id => get(id)));
  }

  async function findBySlug(slug) {
    dlog('findBySlug %s', slug);

    const collectionSnapshot = partnerCollection.where('slug', '==', slug);
    const { size, docs } = await collectionSnapshot.get();

    let result = null;

    if (size === 1) {
      dlog('1');
      const [d] = docs;

      result = {
        id: d.id,
        ...d.data(),
      };
    } else if (size > 1) {
      throw new Error(`Multiple Company Slugs Found for ${slug}`);
    }

    return result;
  }

  async function getAll() {
    const { docs } = await partnerCollection.get();

    return docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  }

  // https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#update
  function update(id, newPartner) {
    dlog('updating id %o', id);

    const scrubbedPartner = newPartner;

    const docRef = dbInstance.doc(`${collectionName}/${id}`);

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
      throw new Error(`Multiple Community records found for slug ${slimslug}`);
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
    getbatchByIds,
    update,
    findIdFromSlug,
    getSlug,
  };
};

export default partner;
