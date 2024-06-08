FROM node:18
WORKDIR /app

COPY server.js ./
RUN npm install express --save
RUN npm install mongoose --save

EXPOSE 3000
CMD ["node","server.js"]