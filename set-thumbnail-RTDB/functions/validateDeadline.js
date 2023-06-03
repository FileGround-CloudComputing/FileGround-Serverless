const { initializeApp } = require("firebase-admin");
const functions = require("firebase-functions");
const { getDatabase } = require("firebase-admin/database");
const database = require("firebase-admin/database");
const firebaseConfig = require("./firebaseConfig");


const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

// 분 시간 일 월 요일 -> 주기를 10분마다로 설정 : 10 * * * *
exports.validateDeadline = functions.pubsub
  .schedule("10 * * * *")
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    while (true) {
      const groundRef = db.ref("grounds");
      const result = await groundRef.orderByChild("createdAt")
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
                functions.logger.log(id + "번 그라운드 삭제 완료. (24시간 경과)");
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
  });