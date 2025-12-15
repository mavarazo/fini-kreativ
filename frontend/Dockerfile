FROM node:lts-bookworm AS builder

ARG HUGO_VERSION=0.152.2
ARG TARGETARCH

RUN apt-get update && apt-get install -y wget git ca-certificates

RUN if [ "$TARGETARCH" = "arm64" ]; then \
    HUGO_ARCH=arm64; \
    else \
    HUGO_ARCH=amd64; \
    fi && \
    wget -O /tmp/hugo.deb \
    https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${HUGO_ARCH}.deb && \
    dpkg -i /tmp/hugo.deb

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN --mount=type=secret,id=strapi_token \
    --mount=type=secret,id=strapi_url \
    STRAPI_API_TOKEN=$(cat /run/secrets/strapi_token) \
    STRAPI_URL=$(cat /run/secrets/strapi_url) \
    node sync.js && hugo --minify
