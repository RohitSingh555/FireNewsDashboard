FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install @tailwindcss/postcss
COPY . .
EXPOSE 3000
CMD ["npm", "start"] 