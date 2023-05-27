/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

("use strict");

// [START import]
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const spawn = require("child-process-promise").spawn;
const path = require("path");
const os = require("os");
const fs = require("fs");
const uuid = require("uuid");
let fileIdNum;
// [END import]

// [START generateThumbnail]
/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * ImageMagick.
 */
// [START generateThumbnailTrigger]

exports.backupDeletedArticle = functions.database.instance('file-ground-grounds').ref('/grounds/{rowId}')
    .onDelete((snapshot, context) => {
      const bucket = admin.storage().bucket();
      const rowId = context.params.rowId; // Store the value of rowId in a variable

      const deleteOptions = {
        prefix: `grounds/${rowId}/`
      };
      // Perform additional permission checks if necessary
      // For example, you can compare the 'uid' to the authenticated user's ID

      return bucket.deleteFiles(deleteOptions)
        .then(() => {
          console.log(`All the Firebase Storage files in grounds/${rowId}/ have been deleted`);
        })
        .catch((err) => {
          console.log(err);
        });
    });

exports.generateThumbnail = functions.storage
  .bucket("file-ground-images")
  .object()
  .onFinalize(async (object) => {
    // [END generateThumbnailTrigger]
    // [START eventAttributes]
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
    // [END eventAttributes]

    // [START stopConditions]
    // Exit if this is triggered on a file that is not an image.
    if (!contentType.startsWith("image/")) {
      return functions.logger.log("This is not an image.");
    }

    // Get the file name.
    const fileName = path.basename(filePath);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith("thumb_")) {
      return functions.logger.log("Already a Thumbnail.");
    }
    // [END stopConditions]

    // [START thumbnailGeneration]
    // Download file from bucket.
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
      contentType,
    };
    await bucket.file(filePath).download({ destination: tempFilePath });
    functions.logger.log("Image downloaded locally to", tempFilePath);
    // Generate a thumbnail using ImageMagick.
    await spawn("convert", [
      tempFilePath,
      "-thumbnail",
      "200x200>",
      tempFilePath,
    ]);
    functions.logger.log("Thumbnail created at", tempFilePath);
    // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
    const thumbFileName = `thumb_${fileName}`;
    const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    // Uploading the thumbnail.
    const uploadBucket = admin.storage().bucket("file-ground-thumbnails");
    await uploadBucket.upload(tempFilePath, {
      destination: thumbFilePath,
      metadata,
    });

    // Import Admin SDK
    const { getDatabase } = require("firebase-admin/database");

    // Get a database reference to our blog
    const db = getDatabase();
    const ref = db.ref("Ground");
    // const refFileId = db.ref("Ground/fileId");
    // gid-userid-username.png
    const uuidOne1 = uuid.v4();
    const uuidOne2 = uuid.v4();
    let arr = [];
    arr = filePath.split("-");
    let arr3 = [];
    arr3 = arr[0].split("/");
    const splitGid = arr3[0];
    console.log(splitGid);
    const splitUserId = arr[1];
    let arr2 = [];
    arr2 = arr[2].split(".");
    const splitUserName = arr2[0];
    // let arr2 = [];
    // arr2 = arr[3].split(".");
    // const splitOriginalFileName = arr2[0];
    await ref
      .get("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          fileIdNum = snapshot.child(`fileId${splitGid}/fileId`).val();
          console.log(fileIdNum);
          console.log(typeof fileIdNum);
        } else {
          ref.child(`fileId${splitGid}`).set({
            fileId: 0,
          });
          fileIdNum = 0;
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    fileIdNum = fileIdNum + 1;
    await ref.child(`fileId${splitGid}`).set({
      fileId: fileIdNum,
    });

    const photosRef = ref.child(`${splitGid}/Photos/${splitGid}-${fileIdNum}`);
    photosRef.set({
      id: fileIdNum,
      src: `gs://file-ground-images/${filePath}`,
      thumbnail: `thumb_${fileIdNum}`,
      uploadedAt: `gs://file-ground-thumbnails/${thumbFilePath}`,
      uploaderId: splitUserId,
      uploaderName: splitUserName,
      likes: "23",
    });
    // Once the thumbnail has been uploaded delete the local file to free up disk space.
    return fs.unlinkSync(tempFilePath);
    // [END thumbnailGeneration]
  });
// [END generateThumbnail]
