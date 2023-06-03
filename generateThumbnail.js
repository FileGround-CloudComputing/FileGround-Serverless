import os from "os";
import fs from "fs";
import path from "path";
import spawn from "child-process-promise";
import { logger } from "firebase-functions/v1";
import { admin } from "./firebase.js";
export const generateThumbnail = async (object) => {
  // [END generateThumbnailTrigger]
  // [START eventAttributes]
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.

  if (!contentType.startsWith("image/")) {
    return logger.log("This is not an image.");
  }

  // Get the file name.
  const fileName = path.basename(filePath);
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith("thumb_")) {
    return logger.log("Already a Thumbnail.");
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
  logger.log("Image downloaded locally to", tempFilePath);
  // Generate a thumbnail using ImageMagick.
  await spawn("convert", [
    tempFilePath,
    "-thumbnail",
    "200x200>",
    tempFilePath,
  ]);
  logger.log("Thumbnail created at", tempFilePath);
  // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
  const thumbFileName = `thumb_${fileName}`;
  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
  // Uploading the thumbnail.
  await bucket.upload(tempFilePath, {
    destination: thumbFilePath,
    metadata,
  });
  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  return fs.unlinkSync(tempFilePath);
  // [END thumbnailGeneration]
};
