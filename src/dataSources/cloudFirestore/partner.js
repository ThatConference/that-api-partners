import debug from 'debug';

const dlog = debug('that:api:partners:datasources:firebase:partner');

const partner = dbInstance => {
  const collectionName = 'partners';
  const partnersCollection = dbInstance.collection(collectionName);

  async function create(newPartner) {
    const scrubbedPartner = newPartner;

    const newDocument = await partnersCollection.add(scrubbedPartner);

    return {
      id: newDocument.id,
      ...scrubbedPartner,
    };
  }

  async function get(id) {
    dlog('get', id);
    const docRef = dbInstance.doc(`${collectionName}/${id}`);
    const doc = await docRef.get();

    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async function findBySlug(slug) {
    const docRef = partnersCollection.where('slug', '==', slug);
    const docs = await docRef.get();

    const results = [];

    docs.forEach(d => {
      results.push({
        id: d.id,
        ...d.data(),
      });
    });

    return results;
  }

  async function getAll() {
    const { docs } = await partnersCollection.get();

    return docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  }

  function getbatchByIds(ids) {
    dlog('getting batch of partners for %o', ids);

    const docRefs = ids.map(id => dbInstance.doc(`${collectionName}/${id}`));

    return Promise.all(docRefs.map(d => d.get())).then(res =>
      res.map(r => ({
        id: r.id,
        ...r.data(),
      })),
    );
  }

  // https://googleapis.dev/nodejs/firestore/latest/DocumentReference.html#update
  async function update(id, newPartner) {
    dlog('updating id %o', id);

    const scrubbedPartner = newPartner;

    const docRef = dbInstance.doc(`${collectionName}/${id}`);
    await docRef.update(scrubbedPartner); // would be nice to handle this better rather than just echo'n our input

    return {
      id,
      ...scrubbedPartner,
    };
  }

  return { create, getAll, get, findBySlug, update, getbatchByIds };
};

export default partner;
