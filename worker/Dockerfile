FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
RUN corepack enable && npm install --omit=dev --prefix . --no-save

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npx tsc

FROM node:22-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "--enable-source-maps", "dist/index.js"]
