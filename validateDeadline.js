import { logger } from "firebase-functions";
import { admin } from "./firebase.js";
export const validateDeadline = async (context) => {
  while (true) {
    const groundRef = admin.database().ref("grounds");
    const result = await groundRef
      .orderByChild("createdAt")
      .limitToFirst(5)
      .once("value")
      .then((snapshot) => {
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
        if (flag) return true;
        return false;
      });

    if (!result) {
      break;
    }
  }

  return null;
};
