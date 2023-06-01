const backupDeletedArticle = functions.database.ref('/grounds/{rowId}')
    .onDelete((snapshot, context) => {
      const bucket = admin.storage().bucket();
      const rowId = context.params.rowId; // Store the value of rowId in a variable

      const deleteOptions = {
        prefix: `grounds/${rowId}/`
      };
  
      return bucket.deleteFiles(deleteOptions)
        .then(() => {
          console.log(`All the Firebase Storage files in grounds/${rowId}/ have been deleted`);
        })
        .catch((err) => {
          console.log(err);
        });
    });