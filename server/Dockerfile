# Unused since github actions does this for us

FROM node:13-alpine AS build

WORKDIR /app/server

COPY server/package.json .
COPY server/package-lock.json .

RUN npm ci

COPY server .
COPY shared ../shared

EXPOSE 53472

ENTRYPOINT [ "npm", "run", "prod" ]
