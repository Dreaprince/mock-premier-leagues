# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application to the container
COPY . .

# Expose the application port (default for Express)
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
