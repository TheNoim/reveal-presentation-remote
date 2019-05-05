(function() {
	if (typeof globalThis === 'object') return;
	Object.prototype.__defineGetter__('__magic__', function() {
		return this;
	});
	__magic__.globalThis = __magic__; // lolwat
	delete Object.prototype.__magic__;
})();

const Reveal = require('reveal.js/js/reveal.js');
const { initRemoteSocket } = require('../../reveal-socket-plugin');

globalThis.Reveal = Reveal;

require('reveal.js/plugin/markdown/marked');
require('reveal.js/plugin/markdown/markdown');
require('reveal.js/plugin/notes/notes.js');

Reveal.initialize({
	controls: true,
	slideNumber: true,
	hash: true,
	mouseWheel: true
});

initRemoteSocket(Reveal);
