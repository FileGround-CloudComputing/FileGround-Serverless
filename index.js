import { pubsub, storage } from "firebase-functions";
import { validateDeadline } from "./functions/validateDeadline";
import { generateThumbnail } from "./functions/generateThumbnail";
import { setThumbnailDb } from "./functions/setThumbnailDb";
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
