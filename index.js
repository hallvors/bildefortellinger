const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const glob = require('glob');
const multer  = require('multer');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

const upload = multer({ dest: __dirname + '/submits' });
const handler = upload.single('mp3');

app.use('/images', express.static('public/images'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/sound', express.static('public/sound'));
app.post('/api/submit', handler, function(req, res, next) {
	let name = req.get('x-bildefortellinger-name') || 'opptak' + parseInt(Math.random() * 100);
	let count = 1;
	let newPath = `./submits/${ name }-${ count }.mp3`;
	while(fs.existsSync(newPath)) {
		count++;
		newPath = `./submits/${ name }-${ count }.mp3`;
	}
	console.log(req.file, newPath)
	fs.renameSync(req.file.path, newPath);
	res.statusCode = 204;
	res.end();
});

app.get('/:picturefolder?/:name?', function(req, res, next) {
	let images = [];
	if (req.params.picturefolder) {
		images = glob.sync(`./public/images/${req.params.picturefolder}/*.jpg`)
			.map(str => str.replace(/^\.\/public/, ''))
			.sort((a, b) => {
				let na = parseInt(a.replace('/images/' + req.params.picturefolder + '/', '').match(/(\d+)/)[1]);
				let nb = parseInt(b.replace('/images/' + req.params.picturefolder + '/', '').match(/(\d+)/)[1]);
				return na < nb ? -1 : 1;
			});
	}
	res.render('index', {images, name: req.params.name});
});

const server = require('http').createServer();
server.on('request', app);
server.listen(process.env.PORT, (err, ok) => {
	if (err) {
		  console.error(err.stack);
		  process.exit(1);
	}
	console.log(`[ready] http://localhost:${process.env.PORT}`);
});
