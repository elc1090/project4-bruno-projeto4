# Estágio de construção
FROM node:14 AS build

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Compila o CSS do Tailwind
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copia os arquivos compilados para o diretório do Nginx
#COPY --from=build /app/dist /app/src /usr/share/nginx/html/

# Copia o arquivo de configuração personalizado do Nginx
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 para permitir o acesso ao frontend
EXPOSE 80

# Comando para iniciar o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
