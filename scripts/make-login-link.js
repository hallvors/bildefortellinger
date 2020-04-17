const jwt = require('jsonwebtoken');
const email = process.argv[2];
if (!email) {
	console.error('missing argument: email');
	process.exit(1);
}
console.log(email)
const token = jwt.sign({email}, process.env.TOKENSECRET);

console.log('https://bildefortellinger.herokuapp.com/admin?t=' + token)
console.log('http://localhost:5000/admin?t=' + token)
