import { pubsub, storage, database } from "firebase-functions";
import { validateDeadline } from "./validateDeadline.js";
import { generateThumbnail } from "./generateThumbnail.js";
import { setThumbnailDb } from "./setThumbnailDb.js";
import { backupDeletedArticle } from "./backupDeletedArticle.js";
export const validateDeadlineFunction = pubsub
  .schedule("10 * * * *")
  .timeZone("Asia/Seoul")
  .onRun(validateDeadline);

export const generateThumbnailFunction = storage
  .object()
  .onFinalize(generateThumbnail);

export const setThumbnailDbFunction = storage
  .object()
  .onFinalize(setThumbnailDb);

export const backupDeletedArticleFunction = database
  .ref("/grounds/{rowId}")
  .onDelete(backupDeletedArticle);
