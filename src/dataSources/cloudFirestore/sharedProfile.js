import debug from 'debug';

const dlog = debug('that:api:members:datasources:sharedprofile');
const collectionName = 'members';
const subCollectionName = 'profiles';
const sharedProfileDocName = 'shared';

const sharedProfile = dbInstance => {
  dlog('shared profile db instance created');

  const memberCollection = dbInstance.collection(collectionName);

  function get(memberId) {
    dlog('get called on %s', memberId);
    return memberCollection
      .doc(memberId)
      .collection(subCollectionName)
      .doc(sharedProfileDocName)
      .get()
      .then(docRef => {
        let d = null;
        if (docRef.exists) {
          d = {
            id: memberId,
            ...docRef.data(),
          };
        }

        return d;
      });
  }

  return { get };
};

export default sharedProfile;
