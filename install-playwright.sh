#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
export APT_LISTCHANGES_FRONTEND=none
apt-get -yq -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" update
npx playwright install chromium --with-deps
