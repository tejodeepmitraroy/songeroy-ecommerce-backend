# Base stage
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare yarn@4.18.1 --activate
WORKDIR /usr/src/app

# Dependencies stage
FROM base AS dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install --immutable

# Build stage
FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node
EXPOSE 8000

CMD ["node", "dist/main.js"]
