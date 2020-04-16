const AWS = require('aws-sdk');
const s3 = AWS.S3();
const S3_BUCKET = 'bildefortellinger-testing';

async function fileExists(key) {
	try {
		exists = await s3.headObject({
			Bucket: S3_BUCKET,
			Key: newPath
		}).promise();
	} catch(e) {
		console.log(e);
		return false;
	}
	return true;
}

module.exports = {
	fileExists
};
