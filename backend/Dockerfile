FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "--loader", "ts-node/esm", "--watch", "src/index.ts"]