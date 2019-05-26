(function() {
	if (typeof globalThis === 'object') return;
	Object.prototype.__defineGetter__('__magic__', function() {
		return this;
	});
	__magic__.globalThis = __magic__; // lolwat
	delete Object.prototype.__magic__;
})();

const io = require('socket.io-client');
const randomWord = require('random-words');
const { get } = require('lodash');
require('clientjs/dist/client.min.js');
const client = new ClientJS();

const calls = [];

let ipInfo = null;

globalThis.setIP = function(json) {
	ipInfo = json;
	for (const call of calls) {
		if (typeof call === 'function') {
			call(json);
		}
	}
};

const ONE_HOUR = 60 * 60 * 1000;

class RevealSocketPlugin {
	constructor(Reveal, address, meta) {
		this.reveal = Reveal;
		this.address = address;
		this.ip = ipInfo;
		this.meta = {
			...meta,
			host: globalThis.location.host
		};
		this.storage = globalThis.localStorage;

		this.init();

		calls.push(json => {
			this.updateIP(json);
		});
	}

	getLastOderNewPassword() {
		const password = randomWord();
		const randomPwSave = () => this.savePassword(password);
		if (!this.storage) return randomPwSave();
		const lastPassword = this.storage.getItem('lastPassword');
		const lastPasswordDateString = this.storage.getItem('lastPasswordDate');
		if (!lastPassword || !lastPasswordDateString) return randomPwSave();
		const lastPasswordDate = new Date(lastPasswordDateString);
		const threeHoursAgo = new Date() - 3 * ONE_HOUR;
		if (threeHoursAgo < lastPasswordDate) {
			return lastPassword;
		} else {
			return randomPwSave();
		}
	}

	savePassword(password) {
		if (!this.storage) return;
		this.storage.setItem('lastPassword', password);
		this.storage.setItem('lastPasswordDate', new Date().toISOString());
		return password;
	}

	init() {
		const password = this.getLastOderNewPassword();
		const passwordSlide = document.getElementById('passwordSlide');
		if (passwordSlide) {
			passwordSlide.innerHTML =
				'Remote Password: <code>' + password + '</code>';
		}

		this.reveal.addEventListener('ready', () => {
			this.socket = io(this.address);

			this.socket.emit('setType', {
				type: 'presentation',
				info: {
					password,
					...this.generateState()
				}
			});

			this.socket.on('getInfo', (data, callback) => {
				callback(this.generateState());
			});

			this.socket.on('sendToPresentation', payload => {
				const action = get(payload, 'action', 'none');
				switch (action) {
					case 'next':
						this.reveal.next();
						break;
					case 'prev':
						this.reveal.prev();
						break;
					case 'up':
						this.reveal.up();
						break;
					case 'down':
						this.reveal.down();
						break;
				}
			});

			this.reveal.addEventListener('slidechanged', event => {
				this.socket.emit('updateState', this.generateState());
			});
		});
	}

	generateState() {
		const slide = this.reveal.getCurrentSlide();
		let slideTitle;
		if (slide) {
			slideTitle = slide.getAttribute('title') || 'No title';
		} else {
			slideTitle = 'No title';
		}
		console.log({ client, ClientJS });
		const state = {
			config: this.reveal.getConfig(),
			total: this.reveal.getTotalSlides(),
			notes: this.reveal.getSlideNotes(),
			indices: this.reveal.getIndices(),
			title: document.getElementsByTagName('title')[0].innerText,
			slideTitle,
			client: {
				browser: client.getBrowser(),
				browserVersion: client.getBrowserVersion(),
				os: client.getOS(),
				device: client.getDevice(),
				lang: client.getLanguage(),
				screenPrint: client.getScreenPrint(),
				resolution: client.getCurrentResolution(),
				availableResolution: client.getAvailableResolution(),
				ip: this.ip
			},
			meta: this.meta
		};
		console.log({ state, slide, thing: this.reveal.getState() });
		return state;
	}

	updateIP(json) {
		if (json && json.ip) {
			this.ip = json.ip;
			if (this.socket) {
				this.socket.emit('updateState', this.generateState());
			}
		}
	}
}

module.exports = {
	initRemoteSocket(Reveal, address, meta = {}) {
		const inst = new RevealSocketPlugin(Reveal, address, meta);
		globalThis.lastRevealSocketPluginInstance = inst;
		return inst;
	}
};
