const io = require('socket.io-client');
const randomWord = require('random-words');
const { get } = require('lodash');

class RevealSocketPlugin {
	constructor(Reveal, address) {
		this.reveal = Reveal;
		this.address = address;

		this.init();
	}

	init() {
		const password = randomWord();
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
		const state = {
			config: this.reveal.getConfig(),
			total: this.reveal.getTotalSlides(),
			notes: this.reveal.getSlideNotes(),
			indices: this.reveal.getIndices(),
			title: document.getElementsByTagName('title')[0].innerText,
			slideTitle
		};
		console.log({ state, slide, thing: this.reveal.getState() });
		return state;
	}
}

module.exports = {
	initRemoteSocket(Reveal, address) {
		return new RevealSocketPlugin(Reveal, address);
	}
};
