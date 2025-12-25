FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-22.04

# Install Node.js
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends nodejs npm \
    && npm install -g yarn \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup component add rust-analyzer

# Install Tauri dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    pkg-config \
    libdbus-1-dev \
    libxdo-dev \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Tauri CLI
RUN cargo install tauri-cli --version "^2.0"

# Set working directory
WORKDIR /workspace

# Install project dependencies
COPY package.json bun.lock ./
RUN npm install -g bun
RUN bun install

COPY . .

# Expose development ports
EXPOSE 1420
EXPOSE 3000

# Set the default command to keep the container running
CMD ["sleep", "infinity"]
