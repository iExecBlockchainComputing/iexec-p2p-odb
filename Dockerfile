FROM node:11

COPY ./package.json /package.json
RUN npm install --no-progress
COPY . /

ENTRYPOINT ["node", "index.js"]

