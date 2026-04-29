FROM node:20-alpine AS base
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app
COPY package*.json ./

# ── Builder ──
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# ── Production ──
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy ONLY what's needed
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# ── Development ──
FROM base AS dev
ENV NODE_ENV=development
ENV PORT=3000
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]