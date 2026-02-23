#!/bin/bash

# Simple shortcut script for the CYOA randomizer tool
# It forwards all arguments to the nodeJS tool.

# Navigate to the directory where the script is located to ensure paths are always correct
cd "$(dirname "$0")"

node tools/randomizer.js "$@"
