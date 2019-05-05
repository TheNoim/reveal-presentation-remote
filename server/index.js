const fastify = require('fastify')();
const path = require('path');
const AutoLoad = require('fastify-autoload');
const io = require('socket.io')(fastify.server);
const { handleSocket } = require('./socket/handleSocket');
const argv = require('yargs')
	.option('port', {
		default: 1337,
		alias: 'p',
		number: true
	})
	.option('host', {
		default: '0.0.0.0',
		alias: 'h'
	}).argv;

fastify.register(require('fastify-static'), {
	root: path.join(__dirname, '../www')
});

fastify.register(AutoLoad, {
	dir: path.join(__dirname, 'routes')
});

handleSocket(io);

fastify.listen(argv.port, argv.host, () => {
	console.log(
		'Server started at: http://' + argv.host + ':' + argv.port + '/'
	);
});
