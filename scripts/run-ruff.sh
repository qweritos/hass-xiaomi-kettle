#!/usr/bin/env sh
set -eu

if command -v ruff >/dev/null 2>&1; then
  exec ruff check custom_components tests_python
fi

if command -v uvx >/dev/null 2>&1; then
  exec uvx ruff check custom_components tests_python
fi

exec python3 -m ruff check custom_components tests_python
