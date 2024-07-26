#!/usr/bin/env bash

rm -rf `find . -type d -name node_modules`
rm -rf `find . -type d -name .next`
rm -rf `find . -type d -name .turbo`
rm -rf `find . -type d -name .strapi`
rm -rf `find . -type d -name dist`
rm -rf `find . -type d -name build`
