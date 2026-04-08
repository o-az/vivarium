FROM oven/bun:latest AS builder

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN NODE_ENV=production bun run build

FROM oven/bun:latest AS runner

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/schema.ts ./src/schema.ts

EXPOSE 3000

CMD ["sh", "-c", "NODE_ENV=production PORT=${PORT:-3000} bun run server/index.ts"]
