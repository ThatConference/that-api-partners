import debug from 'debug';

const dlog = debug('that:api:partners:dataSources:firebase:members');

function sessions(dbInstance) {
  dlog('instance created');

  const collectionName = 'partners';
  const subCollectionName = 'sessions';

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

  async function add(partnerId, sessionId, session) {
    dlog('add');

    const col = dbInstance.collection(
      `${collectionName}/${partnerId}/${subCollectionName}`,
    );
    const docRef = col.doc(sessionId);

    await docRef.set(session, { merge: true });
    const updatedDoc = await docRef.get();

    return {
      id: docRef.id,
      ...updatedDoc.data(),
    };
  }

  function update(partnerId, sessionId, session) {
    dlog('update');

    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${sessionId}`,
    );

    return documentRef.update(session).then(res => ({
      id: sessionId,
      ...session,
    }));
  }

  function remove(partnerId, sessionId) {
    dlog('remove');
    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${sessionId}`,
    );

    return documentRef.delete().then(res => {
      dlog(`removed event ${partnerId} notification: ${sessionId}`);
      return sessionId;
    });
  }

  return { add, update, remove, findPartners };
}

export default sessions;
