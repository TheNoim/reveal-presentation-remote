import Vue from 'vue';
import App from './app.vue';
import VueSocketIO from 'vue-socket.io';
import SocketIO from 'socket.io-client';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Vue2TouchEvents from 'vue2-touch-events';

Vue.use(Vue2TouchEvents);
Vue.use(Buefy);

Vue.use(
	new VueSocketIO({
		debug: true,
		connection: SocketIO()
	})
);

new Vue(App).$mount('#app');
