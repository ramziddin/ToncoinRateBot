FROM node:17.4.0

WORKDIR /app

RUN apt-get update

RUN apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

CMD [ "node", "build/index" ]
