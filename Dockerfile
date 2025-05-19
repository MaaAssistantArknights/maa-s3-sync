FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and your lockfile, here we add pnpm-lock.yaml for illustration
COPY package.json yarn.lock ./

RUN sed -i 's/https:\/\/registry.yarnpkg.com/https:\/\/nexus.home.chingc.cc\/repository\/npm-npmjs/g' yarn.lock

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the entire project
COPY . ./

# Build the project
RUN yarn prisma:generate && yarn build

# Build Stage 2

FROM node:22-alpine
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

EXPOSE 3000/tcp

CMD ["node", "/app/server/index.mjs"]
