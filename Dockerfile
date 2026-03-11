FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV APP_NAME=goals-tracker
EXPOSE 3000
USER node
CMD ["node", "src/index.js"]