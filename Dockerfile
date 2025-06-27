FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# 👇 Set NODE_ENV so Express skips setupVite()
ENV NODE_ENV=production

RUN npm run build

EXPOSE 5000
CMD ["node", "dist/index.js"]
