FROM alpine:edge

RUN \
echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
apk add --no-cache mongodb && \
apk add --no-cache nodejs-current-npm && \
rm /usr/bin/mongoperf

VOLUME /database

#ADD package.json package.json
ADD . .
RUN npm install && npm run clean

LABEL databox.type="store"

EXPOSE 8080

CMD ["npm","start"]