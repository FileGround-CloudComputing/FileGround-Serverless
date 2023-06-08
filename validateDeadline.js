import { logger } from "firebase-functions";
import { admin } from "./firebase.js";
export const validateDeadline = async (context) => {
  while (true) {
    const groundRef = admin.database().ref("grounds");
    const snapshot = await groundRef
      .orderByChild("createdAt")
      .limitToFirst(5)
      .once("value");

    const val = snapshot.val();
    let flag = true;
    for (const ground in val) {
      const leafNode = val[ground];
      const createdAt = new Date(leafNode.createdAt).getTime();
      const now = new Date().getTime();
      const diffHour = (now - createdAt) / (1000 * 60 * 60);
      if (diffHour >= 24) {
        const id = leafNode.id;
        groundRef.ref(id).remove();
        logger.log(id + "번 그라운드 삭제 완료. (24시간 경과)");
      } else {
        flag = false;
        break;
      }
    }
    // flag == false -> 반복 종료
    if (!flag) return true;
  }
};
