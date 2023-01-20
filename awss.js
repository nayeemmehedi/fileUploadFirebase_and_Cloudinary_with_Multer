const AWS = require('aws-sdk');
const fs = require('fs');

// configure the AWS SDK with your S3 access keys
AWS.config.update({
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY'
});

// create an S3 client
const s3 = new AWS.S3();

// read the image file into a buffer
const fileBuffer = fs.readFileSync('path/to/image.jpg');

// configure the parameters for the S3 upload
const params = {
  Bucket: 'my-bucket',
  Key: 'path/to/image.jpg',
  Body: fileBuffer,
  ContentType: 'image/jpeg',
  ACL: 'public-read'
};

// upload the image to S3
s3.upload(params, function(err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Image uploaded to: ${data.Location}`);
  }
});
