FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

EXPOSE 3333

CMD ["node", "ace", "serve", "--watch"]