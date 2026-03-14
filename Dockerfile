FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the standard port the app runs on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
