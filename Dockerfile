FROM node:16-alpine

WORKDIR /app

COPY package* .

RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

COPY . .

CMD ["npm", "start"]
