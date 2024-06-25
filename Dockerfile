# Use an official Node.js runtime as a parent image
FROM node:10-alpine

# Set the working directory in the container
WORKDIR /app

# Install dependencies required for Python build
RUN apk add --no-cache \
    git \
    wget \
    gcc \
    g++ \
    make \
    zlib-dev \
    libffi-dev \
    openssl-dev \
    bzip2-dev \
    xz-dev \
    sqlite-dev \
    ncurses-dev \
    readline-dev \
    tk-dev

# Download and install Python 3.10.14
RUN wget https://www.python.org/ftp/python/3.10.14/Python-3.10.14.tgz && \
    tar xzf Python-3.10.14.tgz && \
    cd Python-3.10.14 && \
    ./configure --enable-optimizations && \
    make altinstall && \
    cd .. && \
    rm -rf Python-3.10.14 Python-3.10.14.tgz

# Create symlinks
RUN ln -s /usr/local/bin/python3.10 /usr/local/bin/python3 && \
    ln -s /usr/local/bin/python3.10 /usr/local/bin/python && \
    ln -s /usr/local/bin/pip3.10 /usr/local/bin/pip3 && \
    ln -s /usr/local/bin/pip3.10 /usr/local/bin/pip

# Copy files to the working directory
COPY . .

# Configure npm & install npm packages
RUN npm config set python $(which python3)
RUN npm install && npm rebuild node-sass

# Default port
ENV PORT=8080

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run the application
CMD ["npx", "quasar", "build"]
