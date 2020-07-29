FROM node:14

COPY ./package.json /package.json
RUN npm install --no-progress
COPY . /

ENTRYPOINT [ "npm", "run", "start" ]

