# Use the official Node.js 20 image as a base
# Knex migrations don't work with NodeJS 21 and 22: https://github.com/knex/knex/issues/6079
FROM node:20 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .


# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
ENTRYPOINT ["./entrypoint.sh"]

# Health check to ensure the container is running
#HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#    CMD curl -f http://localhost:3000/health || exit 1
