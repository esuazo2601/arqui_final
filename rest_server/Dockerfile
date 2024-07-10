FROM node:18

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Copiar el resto de la aplicación
COPY . .

# Asegurar permisos adecuados
RUN chmod -R 755 /app

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["nodemon", "server.js"]
