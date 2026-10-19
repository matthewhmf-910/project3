#!/usr/bin/env bash
# index.html is written for the Artifact host, which adds the document skeleton.
# This wraps it so the page also opens straight from disk in standards mode.
cd "$(dirname "$0")"
{ printf '<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'; cat index.html; printf '\n</body>\n</html>\n'; } > local.html
