FROM node:24-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY ./next/package.json ./

RUN yarn install && yarn upgrade

FROM base AS builder
WORKDIR /app

# Declare build arguments and convert to ENV for Next.js build
ARG NEXT_PUBLIC_TEMPLATE=template1
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER

ENV NEXT_PUBLIC_TEMPLATE=${NEXT_PUBLIC_TEMPLATE}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_PUSHER_KEY=${NEXT_PUBLIC_PUSHER_KEY}
ENV NEXT_PUBLIC_PUSHER_CLUSTER=${NEXT_PUBLIC_PUSHER_CLUSTER}

COPY --from=deps /app/node_modules ./node_modules
COPY ./next .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Declare runtime arguments and set as environment variables
ARG NEXT_PUBLIC_TEMPLATE=template1
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER

ENV NEXT_PUBLIC_TEMPLATE=${NEXT_PUBLIC_TEMPLATE}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_PUSHER_KEY=${NEXT_PUBLIC_PUSHER_KEY}
ENV NEXT_PUBLIC_PUSHER_CLUSTER=${NEXT_PUBLIC_PUSHER_CLUSTER}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN npm install -g pm2

USER nextjs

EXPOSE 6060

ENV PORT 6060

CMD ["pm2-runtime", "start", "server.js"]
