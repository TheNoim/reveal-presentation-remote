import Vue from 'vue';
import App from './app.vue';
import io from 'socket.io-client';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Vue2TouchEvents from 'vue2-touch-events';
import VueSocketio from 'vue-socket.io-extended';

Vue.use(Vue2TouchEvents);
Vue.use(Buefy);

Vue.use(VueSocketio, io('https://remote.noim.io/'));

new Vue(App).$mount('#app');
