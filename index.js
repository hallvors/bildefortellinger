'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const glob = require('glob');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const sClient = require('./lib/sanity_client');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

const upload = multer({ dest: __dirname + '/submits' });
const mp3Handler = upload.single('mp3');

// Some sugar to avoid try/catch in all routes
const asyncRouteHandler = fn => (req, res, next) => {
	return Promise.resolve(fn(req, res, next)).catch(next);
};

app.use('/images', express.static('public/images'));
app.use('/favicon.png', express.static('public/images/favicon.png'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));

app.post(
	'/api/submit',
	mp3Handler,
	asyncRouteHandler(async function(req, res, next) {
		let name =
			req.get('x-bildefortellinger-name') ||
			'opptak' + parseInt(Math.random() * 100);
		let project =
			req.get('x-bildefortellinger-project') ||
			'opptak' + parseInt(Math.random() * 100);
		let meta = JSON.parse(req.body.meta);
		sClient.addRecording(project, name, meta, req.file.path);
		res.statusCode = 204;
		res.end();
	})
);

const adminAuth = asyncRouteHandler(async function(req, res, next) {
	if (!(req.query.t || req.cookies.token)) {
		return res.render('admin/message', {
			layout: 'admin',
			message: 'Ingen tilgang. Bruk tilsendt passord-lenke på nytt.',
		});
	}
	let token = req.query.t || req.cookies.token;
	try {
		let tokenData = jwt.verify(token, process.env.TOKENSECRET);
		let data = await sClient.getAdminUserData(tokenData.email);
		if (!(data && data.length === 1)) {
			return res.render('admin/message', {
				layout: 'admin',
				message: 'Ingen tilgang. Du må be om å bli registrert på nytt.',
			});
		}
		req.user = data[0];
		if (req.query.t && !req.cookies.token) {
			res.cookie('token', token);
		}
		next();
	} catch (e) {
		return res.render('admin/message', {
			layout: 'admin',
			message:
				'Ugyldig tilgang. Du må få ny passord-lenke, for denne virker ikke lenger. ' +
				' Eventuelt kan du prøve å starte nettleseren på nytt og klikke lenka en gang til.' +
				e,
		});
	}
});

app.get(
	'/admin/:project?',
	adminAuth,
	asyncRouteHandler(async function(req, res, next) {
		if (!req.user) {
			// should never happen
			return res.render('admin/message', {
				layout: admin,
				message: 'Uventet feil',
			});
		}
		let project, recordings;
		if (req.params.project) {
			project = await sClient.getProject(req.params.project);
			recordings = await sClient.getRecordings(req.params.project);
		}
		let projects = await sClient.getProjects(req.user._id);
		return res.render('admin/index', {
			layout: 'admin',
			user: req.user,
			projects,
			project,
			recordings,
			helpers: {
				json: obj => JSON.stringify(obj)
			}
		});
	})
);

app.post(
	'/admin/helprecording',
	adminAuth,
	upload.single('helprecording'),
	asyncRouteHandler(async function(req, res, next) {
		await sClient.addHelpRecording(req.body.project, req.file.path);
		res.redirect('/admin/' + req.body.project);
	})
);

app.post(
	'/admin/image',
	adminAuth,
	upload.single('image'),
	asyncRouteHandler(async function(req, res, next) {
		await sClient.addImage(req.body.project, req.file.path);
		res.redirect('/admin/' + req.body.project);
	})
);

app.post('/admin', adminAuth, async function(req, res, next) {
	if (!req.user) {
		// should never happen
		return res.render('admin/message', {
			layout: admin,
			message: 'Uventet feil',
		});
	}

	if (req.body.new_project_name) {
		if (
			req.body.new_project_name === 'admin' ||
			/[^0-9a-zA-ZæøåÆØÅ]/.test(req.body.new_project_name)
		) {
			return res.render('admin/message', {
				layout: 'admin',
				message:
					'Ugyldig navn: kan ikke opprette et prosjekt med dette navnet. Gå tilbake og prøv på nytt.',
			});
		}
		let exists = await sClient.getProject(req.body.new_project_name);
		if (exists) {
			return res.render('admin/message', {
				layout: 'admin',
				message:
					'Navnet er allerede i bruk. Kan ikke opprette ett nytt prosjekt med dette navnet. Gå tilbake og prøv på nytt.',
			});
		}
		// ready to create project
		await sClient.addProject(req.user._id, req.body.new_project_name);
		res.redirect('/admin/' + req.body.new_project_name);
	} else if (req.body.delete_help_recording) {
		await sClient.removeHelpRecording(
			req.body.project,
			req.body.delete_help_recording
		);
		res.redirect('/admin/' + req.body.project);
	} else if (req.body.delete_recording) {
		await sClient.deleteRecording(
			req.body.project,
			req.body.delete_recording
		);
		res.redirect('/admin/' + req.body.project);
	} else if (req.body.edit_recording_details) {
		await sClient.editRecordingDetails(
			req.body.edit_recording_details,
			req.body.pupil,
			req.body.comment
		);
		res.redirect('/admin/' + req.body.project);
	}
});

app.get(
	'/:project?/:name?',
	asyncRouteHandler(async function(req, res, next) {
		let images = [],
			helpaudiourl;
		if (req.params.project) {
			let project = await sClient.getProject(req.params.project);
			if (!project) {
				return next(new Error(404));
			}
			if (project.images) {
				images = project.images.map(image => image.asset.url);
			}
			helpaudiourl =
				project.helprecording && project.helprecording.asset
					? project.helprecording.asset.url
					: null;
		}
		res.render('index', {
			images,
			helpaudiourl,
			name: req.params.name,
			project: req.params.project,
		});
	})
);

const server = require('http').createServer();
server.on('request', app);
server.listen(process.env.PORT, (err, ok) => {
	if (err) {
		console.error(err.stack);
		process.exit(1);
	}
	console.log(`
		[ready] http://localhost:${process.env.PORT}
		Sanity: ${process.env.SANITY_PROJECT}
	`);
});
