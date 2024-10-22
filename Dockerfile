# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
# This is done before copying the entire project to take advantage of cached Docker layers.
# Docker will only re-run npm install if these files change.
COPY package*.json ./

# Install app dependencies
# Adding the --production flag to avoid installing development dependencies in production.
RUN npm install --production

# Copy the rest of your application to the container
COPY . .

# Good practice to use a non-root user to run your application
USER node

# Expose the application port (default for Express)
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
