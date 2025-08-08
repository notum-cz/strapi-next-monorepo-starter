#!/usr/bin/env bash

if [ "$APP" == "ui" ]; then
    yarn build:ui && yarn build:ui && rm -rf apps/strapi .turbo node_modules/.cache
elif [ "$APP" == "strapi" ]; then
    yarn build:strapi
else
    echo "Invalid APP env value. Please set APP to one of: ui, strapi"
fi
