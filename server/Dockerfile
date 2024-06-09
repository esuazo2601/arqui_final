# Dockerfile para el servidor Express

FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de configuración y dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto que utiliza la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación en modo desarrollo con nodemon
CMD ["npm", "run", "dev"]
