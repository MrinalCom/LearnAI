FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install
EXPOSE 4000
CMD ["pnpm", "--filter", "@learning/api", "dev"]
