const sanity = require('@sanity/client');
const fs = require('fs');
const {nanoid} = require('nanoid');

const PROJECT = process.env.SANITY_PROJECT;
const TOKEN = process.env.SANITY_TOKEN;
const DATASET = 'production';

var sanityClient = null;
function getSanityClient() {
	if (!sanityClient) {
		sanityClient = sanity({
			projectId: PROJECT,
			dataset: DATASET,
			token: TOKEN,
			useCdn: false,
		});
	}
	return sanityClient;
}

function getAdminUserData(email) {
	return getSanityClient().fetch('*[_type == $type && email == $email]', {
		type: 'adminUser',
		email,
	});
}

function getProjects(userId) {
	return getSanityClient().fetch('*[_type == $type && owner._ref == $userId] {name, _id}', {
		type: 'project',
		userId,
	});
}

function addProject(userId, name) {
	return getSanityClient().create({
		_type: 'project',
		owner: {_ref: userId},
		name
	});
}

function getProject(name) {
	return getSanityClient().fetch(`
		*[_type == $type && name == $name] {
			_id,
			name,
			helprecording{asset->{url, _id}},
			images[]{asset->{url, "preview": metadata.lqip}}
		}`, {
		type: 'project',
		name,
	})
	.then(result => result[0]);
}

function addHelpRecording(projectName, filepath) {
	const cl = getSanityClient();
	return getProject(projectName)
	.then(project => {
		return cl.assets
		.upload('file', fs.createReadStream(filepath))
		.then(doc => {
			return cl.patch(project._id)
			.set({
				helprecording: {
					_type: 'file',
					asset: {
						_type: "reference",
						_ref: doc._id
					}
				}
			})
			.commit();
		});
	});
}

function removeHelpRecording(projectName, fileId) {
	const cl = getSanityClient();
	return getProject(projectName)
	.then(project => {
		return cl
		.transaction()
		.patch(
			cl.patch(project._id)
			.unset(['helprecording'])
		)
		.delete(fileId)
		.commit();
	});
}

function addImage(projectName, filepath) {
	const cl = getSanityClient();
	return getProject(projectName)
	.then(project => {
		return cl.assets
		.upload('image', fs.createReadStream(filepath))
		.then(doc => {
			return cl.patch(project._id)
			.setIfMissing({images: []})
			.append('images', [{
				_type: 'image',
				_key: nanoid(),
				asset: {
					_type: 'reference',
					_ref: doc._id
				}
			}])
			.commit();
		});
	});
}

function addRecording(projectName, pupil, meta, filepath) {
	const cl = getSanityClient();
	return getProject(projectName)
	.then(project => {
		return cl.assets
		.upload('file', fs.createReadStream(filepath),
			{filename: pupil + '-opptak.mp3'})
		.then(doc => {
			return cl.create({
				_type: 'recording',
				pupil,
				project: {
					_ref: project._id,
				},
				recording: {
					_type: 'file',
					asset: {
						_type: "reference",
						_ref: doc._id
					}
				},
				meta,
			})
		});
	});
}

function editRecordingDetails(id, pupil, comment) {
	return getSanityClient()
		.patch(id)
		.set({pupil, comment})
		.commit();
}

function getRecordings(projectName) {
	return getProject(projectName)
	.then(project => {
		return getSanityClient().fetch(`*[
			_type == $type && project._ref == $projectId
		] {_id, _createdAt, pupil, meta, comment, "url": recording.asset->url}`, {
			type: 'recording',
			projectId: project._id,
		});
	});
}

function deleteRecording(projectName, id) {
	const client = getSanityClient();
	return getProject(projectName)
	.then(project => {
		console.log(project);
		// just to check this recording belongs to the right project
		return client.fetch(`*[
			_type == $type && project._ref == $projectId && _id == $_id
		] {...}`, {
			type: 'recording',
			_id: id,
			projectId: project._id,
		})
		.then(recData => {
			console.log(recData[0]);
			if (recData.length === 1) {
				return client.delete(id)
				.then(() => {
					// also remove asset file
					return client.delete(recData[0].recording.asset._ref);
				});
			}
			throw new Error('Unexpected delete attempt');
		});
	});
}

module.exports = {
	getSanityClient,
	getAdminUserData,
	getProjects,
	getProject,
	addProject,
	addHelpRecording,
	removeHelpRecording,
	addRecording,
	addImage,
	editRecordingDetails,
	getRecordings,
	deleteRecording,
};
