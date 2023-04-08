const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Download file from bucket.
const bucket = admin.storage().bucket(fileBucket);
const tempFilePath = path.join(os.tmpdir(), fileName);
const metadata = {
  contentType: contentType,
};
await bucket.file(filePath).download({destination: tempFilePath});
functions.logger.log('Image downloaded locally to', tempFilePath);
// Generate a thumbnail using ImageMagick.
await spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
functions.logger.log('Thumbnail created at', tempFilePath);
// We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
const thumbFileName = `thumb_${fileName}`;
const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
// Uploading the thumbnail.
await bucket.upload(tempFilePath, {
  destination: thumbFilePath,
  metadata: metadata,
});
// Once the thumbnail has been uploaded delete the local file to free up disk space.
return fs.unlinkSync(tempFilePath);
