#!/bin/bash

set -ex

SCRIPT_DIR=$(dirname $(readlink -f $0))
cd ${SCRIPT_DIR}

./download-fonts.sh

rm -rf release
mkdir release

git ls-files . | cpio -pdm release
cp -r src/assets/fonts release/src/assets/

pushd release
docker run --rm --entrypoint "sh" \
    -u 1000:1000 \
    -v ${PWD}/:/mnt/ \
    -w /mnt \
    node:alpine \
    -c "npm ci && npm run-script ng -- build -c production --base-href /"

cd dist
zip marsbot-challenge-client.zip -r marsbot-challenge-client
mv marsbot-challenge-client.zip ${SCRIPT_DIR}
popd
rm -rf release
