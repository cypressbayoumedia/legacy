#!/bin/bash
set -e

# Directory to install
INSTALL_DIR="$HOME/google-cloud-sdk"

# Check if already installed
if [ -d "$INSTALL_DIR" ]; then
    echo "Google Cloud SDK appears to be installed at $INSTALL_DIR"
    echo "Try running: source $INSTALL_DIR/path.bash.inc"
    exit 0
fi

echo "Downloading Google Cloud SDK..."
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz

echo "Extracting..."
tar -xf google-cloud-cli-linux-x86_64.tar.gz -C $HOME

echo "Running installation script..."
# Run install script with --quiet to avoid interactive prompts
$INSTALL_DIR/install.sh --quiet --path-update=true --usage-reporting=false

echo "Cleaning up..."
rm google-cloud-cli-linux-x86_64.tar.gz

echo "Installation complete!"
echo "Please restart your terminal OR run the following command to start using gcloud immediately:"
echo "source $INSTALL_DIR/path.bash.inc"
