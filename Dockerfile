# --- Stage 1: Build the app ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Set environment vars
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
