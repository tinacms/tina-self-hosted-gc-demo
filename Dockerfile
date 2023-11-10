FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
ARG MONGODB_URI
ARG NEXTAUTH_SECRET
ARG GITHUB_BRANCH

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NO_TELEMETRY 1

RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner

ENV GITHUB_BRANCH=''
ENV GITHUB_OWNER=''
ENV GITHUB_REPO=''
ENV GITHUB_PERSONAL_ACCESS_TOKEN=''
ENV MONGODB_URI=''
ENV NEXTAUTH_SECRET=''
ENV NEXTAUTH_URL=''

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NO_TELEMETRY 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tinacms

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/_site ./_site
COPY --from=builder /app/dist ./dist

USER tinacms

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "dist/app.js"]
