import { auth as FirebaseAuth, firestore as Firestore } from 'firebase';
import { size, values, map, forEach, flatten, includes } from 'lodash';

import Entities from 'constants/entities';

export const getCurrentUser = () =>
  new Promise(resolve => {
    FirebaseAuth().onAuthStateChanged(user => {
      resolve(user ? user.toJSON() : null);
    });
  });

export const updateCurrentUser = ({ displayName }) =>
  FirebaseAuth().currentUser.updateProfile({ displayName });

export const doFacebookLogin = () => {
  const provider = new FirebaseAuth.FacebookAuthProvider();
  return FirebaseAuth().signInWithPopup(provider);
};

export const doGoogleLogin = () => {
  const provider = new FirebaseAuth.GoogleAuthProvider();
  return FirebaseAuth().signInWithPopup(provider);
};

export const doSignup = (email, password) =>
  FirebaseAuth().createUserWithEmailAndPassword(email, password);

export const doLogin = (email, password) =>
  FirebaseAuth().signInWithEmailAndPassword(email, password);

export const doLogout = () => FirebaseAuth().signOut();

export const doPasswordReset = email =>
  FirebaseAuth().sendPasswordResetEmail(email);

export const uploadEntities = (entities, uid, sectorId) => {
  if (!sectorId && !size(entities[Entities.sector.key])) {
    throw new Error(
      'To save entities a new sector must exist or an existing sector should be given',
    );
  }

  let savableSectorId = sectorId;
  const allKeys = flatten(values(map(entities, Object.keys)));
  const keyMapping = {};
  const saveEntityTree = (parentId, newParentId) => {
    const batch = Firestore().batch();
    forEach(entities, (entityTypes, entityType) =>
      forEach(entityTypes, (entity, oldId) => {
        if (
          parentId !== entity.parent &&
          (parentId || includes(allKeys, entity.parent))
        ) {
          return Promise.resolve();
        }

        const timestamp = Firestore.FieldValue.serverTimestamp();
        const savableEntity = {
          ...entity,
          creator: uid,
          created: timestamp,
          updated: timestamp,
        };
        if (newParentId) {
          savableEntity.parent = newParentId;
          savableEntity.sector = savableSectorId;
        }
        const newRef = Firestore()
          .collection('entities')
          .doc(entityType)
          .collection('entity')
          .doc();
        batch.set(newRef, savableEntity);
        keyMapping[oldId] = newRef.id;
        if (entityType === Entities.sector.key) {
          savableSectorId = newRef.id;
        }
        return saveEntityTree(oldId, newRef.id);
      }),
    );
    return batch.commit();
  };

  return saveEntityTree().then(() => ({ mapping: keyMapping }));
};

export const getSyncedSectors = uid => {
  let entities = {};
  return Promise.all(
    map(Entities, ({ key }) =>
      Firestore()
        .collection('entities')
        .doc(key)
        .collection('entity')
        .where('creator', '==', uid)
        .get()
        .then(typeSnapshot => {
          typeSnapshot.forEach(doc => {
            entities = {
              ...entities,
              [key]: {
                ...entities[key],
                [doc.id]: doc.data(),
              },
            };
          });
          return entities;
        }),
    ),
  ).then(() => entities);
};

export const updateEntities = entities => {
  const batch = Firestore().batch();
  forEach(entities, (entityUpdates, entityType) =>
    forEach(entityUpdates, (update, entityId) =>
      batch.update(
        Firestore()
          .collection('entities')
          .doc(entityType)
          .collection('entity')
          .doc(entityId),
        {
          ...update,
          updated: Firestore.FieldValue.serverTimestamp(),
        },
      ),
    ),
  );
  return batch.commit();
};

export const deleteEntities = entities => {
  const batch = Firestore().batch();
  forEach(entities, (entityIds, entityType) =>
    entityIds.forEach(entityId =>
      batch.delete(
        Firestore()
          .collection('entities')
          .doc(entityType)
          .collection('entity')
          .doc(entityId),
      ),
    ),
  );
  return batch.commit();
};
