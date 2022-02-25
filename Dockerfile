FROM node:17.4.0

WORKDIR /app

RUN apt-get update

RUN apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
