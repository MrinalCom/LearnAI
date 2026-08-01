FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "--filter", "@learning/web", "dev"]
