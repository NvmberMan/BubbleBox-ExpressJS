FROM node:16-alpine

WORKDIR /app

COPY package* .

RUN npm i

COPY . .

CMD ["node", "index.js"]