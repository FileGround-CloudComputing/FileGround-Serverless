const functions = require("firebase-functions");
const path = require('path');
const admin = require('firebase-admin');
admin.initializeApp({
  databaseURL: "https://file-ground-grounds.asia-southeast1.firebasedatabase.app"
});

const THUMB_PREFIX = 'thumb_';

exports.setThumbnailRTDB = functions.storage.bucket().object().onFinalize(async (object) => {
    const thumbnailPath = object.name; // Thumbnail path in the bucket.
    const thumbnailDir = path.dirname(thumbnailPath); // ex)grounds/0/...
    const thumbnailName = path.basename(thumbnailPath); // Get the Thumbnail name.

    const groundid = thumbnailDir.split(path.sep)[1];

    // Exit if the image is not a thumbnail
    if (!thumbnailName.startsWith(THUMB_PREFIX)) {
      console.log('This is not a Thumbnail.');
      return null;
    }
    
    const fileName = thumbnailName.replace(THUMB_PREFIX, '');

    return admin.database().ref().child(`grounds/${groundid}/photos/${fileName}`).update({ thumbnail: thumbnailPath })
  });