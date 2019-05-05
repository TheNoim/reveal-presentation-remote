FROM node:dubnium-alpine

LABEL maintainer="Nils Bergmann <nilsbergmann@noim.io>"
LABEL org.label-schema.url="https://github.com/TheNoim/reveal-presentation-remote"
LABEL org.label-schema.name="Reveal.js remote management server"

WORKDIR /app

ADD package.json package.json
ADD yarn.lock yarn.lock

RUN yarn 

ADD src-www/ src-www/
ADD reveal-socket-plugin.js reveal-socket-plugin.js

RUN yarn build:docker && \
    rm -rf src-www/ && \
    rm -f reveal-socket-plugin.js

ADD server/ server/

CMD ["node", "server/index.js"]