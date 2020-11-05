# Unused since github actions does this for us

FROM node:13-alpine AS build

WORKDIR /app/client

COPY client/package.json .
COPY client/package-lock.json .

RUN npm ci

COPY client .
COPY shared ../shared

RUN npm run build

###

FROM nginx:1.13.3-alpine AS base
COPY --from=build /app/client/dist /usr/share/nginx/html
