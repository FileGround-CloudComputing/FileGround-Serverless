import { logger } from "firebase-functions/v1";
import { admin } from "./firebase.js";
export const backupDeletedArticle = async (snapshot, context) => {
  const bucket = admin.storage().bucket();
  const rowId = context.params.rowId; // Store the value of rowId in a variable

  const deleteOptions = {
    prefix: `grounds/${rowId}/`,
  };

  return await bucket
    .deleteFiles(deleteOptions)
    .then(() => {
      logger(
        `All the Firebase Storage files in grounds/${rowId}/ have been deleted`
      );
    })
    .catch((err) => {
      logger(err);
    });
};
