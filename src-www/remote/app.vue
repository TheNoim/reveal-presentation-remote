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
        <h1 class="title">Remote</h1>
        <div v-if="!presentation">
          <div class="level" v-for="(pres, index) in presentations" :key="index">
            <div class="level-left">
              <div class="level-item">
                <p class="subtitle is-5">
                  <strong>{{pres.info.title}}</strong>
                </p>
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
export default {
    name: 'app',
    data() {
        return {
            presentation: null,
            presentations: []
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
                    let pw = value;
                    if (pw === '') pw = null;
                    this.$socket.emit(
                        'subscribeTo',
                        {
                            password: pw,
                            id
                        },
                        state => {
                            if (state) {
                                this.presentation = state;
                            }
                        }
                    );
                }
            });
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
        }
    }
};
</script>

<style scoped>
.h100 {
    height: 100vh;
}
</style>
