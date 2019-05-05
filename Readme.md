# Reveal Remote

Build with socket.io and fastify.

## Usage

1. Clone this repo
2. Install dependencies:

	```bash
    # With yarn
    yarn
    # or with npm
    npm install
   ```
3. Run server

	```bash
    node server/index.js --port 1337 --host 0.0.0.0
   ```
4. Setup your presentation

    1. Setup your reveal project
    2. Install this from npmmn

		```bash
       # With yarn
       yarn add reveal-socket-remote
       # or with npm
       npm install reveal-socket-remote --save 
		```

    3. Import the plugin

		```javascript
		// Setup your reveal stuff
		// [...]
		// Then import my plugin
		const { initRemoteSocket } = require('reveal-socket-remote');
		// Now you can init the connection
		// The first argument needs to be the Reveal instance
		initRemoteSocket(Reveal, 'your server address here')
		```
