#!/bin/bash

set -ex

SCRIPT_DIR=$(dirname $(readlink -f $0))
cd ${SCRIPT_DIR}/src/assets

rm -rf fonts
mkdir fonts
cd fonts

curl -o material-icons.ttf "https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf"
curl -o roboto-300.ttf "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5vAw.ttf"
curl -o roboto-400.ttf "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf"
curl -o roboto-500.ttf "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAw.ttf"

