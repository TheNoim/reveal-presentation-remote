<template>
  <section
    class="hero h100"
    v-touch:swipe.left="swipeLeft"
    v-touch:swipe.right="swipeRight"
    v-touch:swipe.top="swipeUp"
    v-touch:swipe.bottom="swipeDown"
  >
    <div class="hero-body">
      <div class="container">
        <h4 class="title is-5">Remote</h4>
        <div v-if="!presentation">
          <div class="level" v-for="(pres, index) in presentations" :key="index">
            <div class="level-left">
              <div class="level-item">
                <div>
                  <p class="subtitle is-5">
                    <strong>{{pres.info.title}}</strong>
                  </p>
                  <p v-if="clientInfo(pres)" v-html="clientInfo(pres)"></p>
                </div>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <b-button @click="connect(pres.id)" type="is-primary">Connect</b-button>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <h2 class="subtitle">{{presentation.title}}</h2>
          <div class="level is-mobile">
            <div class="level-left">
              <div class="level-item">{{presentation.slideTitle}}</div>
            </div>
            <div class="level-right">
              <div class="level-item">Slide: {{currentPage}}/{{presentation.total}}</div>
            </div>
          </div>
          <h2 class="subtitle">Notes:</h2>
          <div class="content" v-html="presentation.notes"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { get } from 'lodash-es';

export default {
    name: 'app',
    data() {
        return {
            presentation: null,
            presentations: [],
            lastPassword: null,
            lastId: null
        };
    },
    mounted() {
        this.$socket.emit('setType', {
            type: 'remote'
        });

        this.$socket.emit('listPresentations', '', data => {
            this.presentations = data;
        });
    },
    computed: {
        currentPage() {
            if (!this.presentation) return '0';
            const hor = this.presentation.indices.h + 1;
            const vert = this.presentation.indices.v;
            let page = `${hor}`;
            if (vert !== 0) page += `.${vert + 1}`;
            return page;
        }
    },
    sockets: {
        presentationList(list) {
            this.presentations = list;
        },
        updateState(state) {
            this.presentation = state;
        },
        destroy() {
            this.presentation = null;
        },
        reconnect() {
            if (this.lastPassword && this.lastId) {
                this.$snackbar.open(`Try to resubscribe...`);
                this.subscribeTo(this.lastId, this.lastPassword);
            }
        }
    },
    methods: {
        connect(id) {
            this.$dialog.prompt({
                message: `Password`,
                inputAttrs: {
                    placeholder: 'my secret password'
                },
                onConfirm: value => {
                    this.subscribeTo(id, value);
                }
            });
        },
        subscribeTo(id, password) {
            let pw = password;
            if (pw === '') pw = null;
            if (typeof pw === 'string') pw = pw.toLowerCase();
            this.$socket.emit(
                'subscribeTo',
                {
                    password: pw,
                    id
                },
                state => {
                    if (state) {
                        this.lastPassword = password;
                        this.presentation = state;
                        this.lastId = id;
                        this.$snackbar.open(`Successfully subscribed!`);
                    }
                }
            );
        },
        swipeLeft() {
            if (this.presentation) {
                this.$socket.emit('sendToPresentation', {
                    action: 'next'
                });
            }
        },
        swipeRight() {
            if (this.presentation) {
                this.$socket.emit('sendToPresentation', {
                    action: 'prev'
                });
            }
        },
        swipeUp() {
            if (this.presentation) {
                this.$socket.emit('sendToPresentation', {
                    action: 'down'
                });
            }
        },
        swipeDown() {
            if (this.presentation) {
                this.$socket.emit('sendToPresentation', {
                    action: 'up'
                });
            }
        },
        clientInfo(pres) {
            let string = '';
            const country = get(pres, 'info.client.ip.country_code', false);
            const ip = get(pres, 'info.client.ip.ip', false);
            const os = get(pres, 'info.client.os', false);
            const host = get(pres, 'info.meta.host', false);
            const env = get(pres, 'info.meta.env', 'unknown');
            if (country) {
                const countryLowerCase = country.toLowerCase();
                string += `<img style="height: 20px;" src="https://www.countryflags.io/${countryLowerCase}/flat/32.png">`;
            }
            if (ip) {
                string = addAndExtend(string, ip);
            }
            if (os) {
                string = addAndExtend(string, os);
            }
            if (host) {
                string = addAndExtend(string, host);
            }
            if (env) {
                switch (env) {
                    case 'production':
                        string = addAndExtend(string, 'Pro');
                        break;
                    case 'development':
                        string = addAndExtend(string, 'Dev');
                        break;
                    default:
                    case 'unknown':
                        string = addAndExtend(string, 'Unk');
                        break;
                }
            }

            if (string === '') return false;
            return string;
        }
    }
};

function addAndExtend(src, add) {
    if (src.endsWith(' - ')) {
        return src + add;
    } else {
        if (src !== '') {
            return src + ' - ' + add;
        } else {
            return src + add;
        }
    }
}
</script>

<style scoped>
.h100 {
    height: 100vh;
}
</style>

<style>
.no-note {
    display: none;
}
</style>
