import { pubsub, storage } from "firebase-functions";
import { validateDeadline } from "./functions/validateDeadline";
import { generateThumbnail } from "./functions/generateThumbnail";
export const validateDeadlineFunction = pubsub
  .schedule("10 * * * *")
  .timeZone("Asia/Seoul")
  .onRun(validateDeadline);

export const generateThumbnailFunction = storage
  .object()
  .onFinalize(generateThumbnail);
