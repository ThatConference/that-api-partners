import debug from 'debug';

const dlog = debug('that:api:partners:dataSources:firebase:members');

function members(dbInstance) {
  dlog('instance created');

  const collectionName = 'partners';
  const subCollectionName = 'members';

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

  function findMemberAtPartner({ partnerId, memberId }) {
    dlog('find member, %s, at partner, %s', memberId, partnerId);

    return dbInstance
      .collection(collectionName)
      .doc(partnerId)
      .collection(subCollectionName)
      .doc(memberId)
      .get()
      .then(docRef => {
        let r = null;
        if (docRef.exists) {
          r = {
            id: docRef.id,
            ...docRef.data(),
          };
        }

        return r;
      });
  }

  async function add(partnerId, memberId, member) {
    dlog('add');

    const col = dbInstance.collection(
      `${collectionName}/${partnerId}/${subCollectionName}`,
    );
    const docRef = col.doc(memberId);

    await docRef.set(member, { merge: true });
    const updatedDoc = await docRef.get();

    return {
      id: docRef.id,
      ...updatedDoc.data(),
    };
  }

  function update(partnerId, memberId, member) {
    dlog('update');

    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${memberId}`,
    );

    return documentRef.update(member).then(() =>
      documentRef.get().then(upDocRef => {
        let r = null;
        if (upDocRef.exists) {
          r = {
            id: upDocRef.id,
            ...upDocRef.data(),
          };
        }

        return r;
      }),
    );
  }

  function remove(partnerId, memberId) {
    dlog('remove');
    const documentRef = dbInstance.doc(
      `${collectionName}/${partnerId}/${subCollectionName}/${memberId}`,
    );

    return documentRef.delete().then(res => {
      dlog(`removed event ${partnerId} notification: ${memberId}`);
      return memberId;
    });
  }

  return { findPartners, findMemberAtPartner, add, update, remove };
}

export default members;
