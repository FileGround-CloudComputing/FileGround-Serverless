import { pubsub } from "firebase-functions";
import { validateDeadline } from "./validateDeadline";
export const validateDeadlineFunction = pubsub
  .schedule("10 * * * *")
  .timeZone("Asia/Seoul")
  .onRun(validateDeadline);
