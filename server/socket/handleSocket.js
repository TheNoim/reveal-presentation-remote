const { get } = require('lodash');

const presentations = {};
const remotes = {};

const transformRequest = callback => {
	return (...args) => {
		try {
			const socketCallback = args[args.length - 1];
			if (typeof socketCallback === 'function') {
				callback(socketCallback, ...args);
			}
		} catch (e) {}
	};
};

const sendPresentationList = () => {
	const presentationList = [];
	for (const id in presentations) {
		if (!presentations.hasOwnProperty(id)) continue;
		presentationList.push({
			id: id,
			info: presentations[id].info
		});
	}
	for (const remoteId in remotes) {
		if (!remotes.hasOwnProperty(remoteId)) continue;
		const remote = remotes[remoteId];
		const socket = remote.socket;
		socket.emit('presentationList', presentationList);
	}
};

module.exports = {
	/**
	 *
	 * @param {SocketIO.Server} server
	 */
	handleSocket(server) {
		server.on('connection', socket => {
			socket.on('disconnect', () => {
				if (remotes[socket.id]) {
					delete remotes[socket.id];
				}
				if (presentations[socket.id]) {
					for (const remoteId in remotes) {
						if (!remotes.hasOwnProperty(remoteId)) continue;
						const remote = remotes[remoteId];
						if (remote.presentation === socket.id) {
							remote.socket.emit('destroy');
							delete presentations[remote.presentation].info;
							delete remote.presentation;
						}
					}
					delete presentations[socket.id];
				}
				sendPresentationList();
			});

			socket.on('setType', to => {
				const type = get(to, 'type', 'invalid');
				const information = get(to, 'info', {});
				if (type === 'presentation') {
					const password = get(information, 'password', false);
					if (password) delete information['password'];
					presentations[socket.id] = {
						info: information,
						socket: socket,
						password
					};
					sendPresentationList();
				} else if (type === 'remote') {
					remotes[socket.id] = {
						info: information,
						socket: socket
					};
				}
			});

			socket.on(
				'listPresentations',
				transformRequest(callback => {
					const presentationList = [];
					for (const id in presentations) {
						if (!presentations.hasOwnProperty(id)) continue;
						presentationList.push({
							id: id,
							info: presentations[id].info
						});
					}
					callback(presentationList);
				})
			);

			//
			socket.on(
				'subscribeTo',
				transformRequest((callback, payload) => {
					if (!remotes[socket.id]) return callback(false);
					const password = get(payload, 'password');
					const id = get(payload, 'id');
					if (!id) return callback(false);
					const presentation = get(presentations, id, false);
					if (!presentation)
						return callback('No presentation with this id');
					if (
						presentation.password &&
						presentation.password !== password
					)
						return callback('Invalid password');
					const presentationSocket = get(presentation, 'socket');
					presentationSocket.emit('getInfo', '', info => {
						remotes[socket.id].presentation = id;
						callback(info);
					});
				})
			);

			// Send the new state to all remotes
			socket.on('updateState', state => {
				for (const remoteId in remotes) {
					if (!remotes.hasOwnProperty(remoteId)) continue;
					const remote = remotes[remoteId];
					if (remote.presentation === socket.id) {
						if (presentations[remote.presentation]) {
							presentations[remote.presentation].info = state;
						}
						remote.socket.emit('updateState', state);
					}
				}
			});

			socket.on('sendToPresentation', data => {
				if (!remotes[socket.id]) return;
				const remote = remotes[socket.id];
				if (!remote.presentation) return;
				if (!presentations[remote.presentation]) return;
				presentations[remote.presentation].socket.emit(
					'sendToPresentation',
					data
				);
			});
		});
	}
};
