#!/usr/bin/env bash
# index.html is written for the Artifact host (which adds the document skeleton and loads three.js from cdnjs).
# This wraps it for opening from disk and points three.js at the local npm copy.
cd "$(dirname "$0")"
{ printf '<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'
  sed 's#https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js#../node_modules/three/build/three.min.js#' index.html
  printf '\n</body>\n</html>\n'; } > local.html
