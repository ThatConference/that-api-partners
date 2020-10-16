import debug from 'debug';
import partnerStore from '../dataSources/cloudFirestore/partner';

const dlog = debug('that:api:partners:findBy');

export default function eventFindBy(findBy, firestore) {
  // parses findBy parameter and looks up id/slug ad needed
  // id takes precidence if both are provided
  const { id, slug } = findBy;
  if (!id && !slug)
    throw new Error(
      `partner findBy requires an id or slug. Neither were provided`,
    );

  let result = {};
  if (slug && !id) {
    dlog('find partner id by slug');
    return partnerStore(firestore)
      .findIdFromSlug(slug)
      .then(d => {
        if (d) {
          result = {
            partnerId: d.id,
            slug,
          };
        }
        dlog('slug/id result %o', result);
        return result;
      });
  }
  dlog('partner by id');
  // id only or id and slug sent
  // get slug/verify slug-id relationship
  return partnerStore(firestore)
    .getSlug(id)
    .then(e => {
      if (e) {
        if (slug && slug !== e.slug)
          throw new Error('Partner slug and id provided do not match.');
        result = {
          partnerId: e.id,
          slug: e.slug,
        };
      }
      dlog('slug/id result %o', result);
      return result;
    });
}
