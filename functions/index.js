const functions = require("firebase-functions");
const path = require('path');
const admin = require('firebase-admin');
admin.initializeApp();

const THUMB_PREFIX = 'thumb_';

exports.setThumbnailRTDB = functions.storage
  .bucket("file-ground-images")
  .object()
  .onFinalize(async (object) => {
    const thumbnailPath = object.name; // Thumbnail path in the bucket.
    const thumbnailDir = path.dirname(thumbnailPath); // ex)grounds/0/...
    const thumbnailName = path.basename(thumbnailPath); // Get the Thumbnail name.

    // Exit if the image is not a thumbnail
    if (!thumbnailName.startsWith(THUMB_PREFIX)) {
      console.log('This is not a Thumbnail.');
      return null;
    }

    const fileName = thumbnailName.replace(THUMB_PREFIX, '');

    return admin.database().ref().child(`${thumbnailDir}/photos/${fileName}`).update({ thumbnail: thumbnailPath })
  });