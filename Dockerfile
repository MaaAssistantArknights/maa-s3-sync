FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and your lockfile, here we add pnpm-lock.yaml for illustration
COPY package.json yarn.lock ./

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
COPY prisma /app/prisma/

COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000/tcp

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["node", "/app/server/index.mjs"]
