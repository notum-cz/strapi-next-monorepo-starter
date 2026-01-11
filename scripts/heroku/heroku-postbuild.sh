#!/usr/bin/env bash

if [ "$APP" == "ui" ]; then
    yarn build:ui
elif [ "$APP" == "strapi" ]; then
    yarn build:strapi
else
    echo "Invalid APP env value. Please set APP to one of: ui, strapi"
fi
