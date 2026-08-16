FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install
RUN pnpm --filter @learning/api build
EXPOSE 4000
CMD ["pnpm", "--filter", "@learning/api", "start"]
