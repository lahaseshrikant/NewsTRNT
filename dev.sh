#!/usr/bin/env bash
# dev.sh - cross‑platform helper (Mac/Linux/WSL)
# run from repo root: `bash dev.sh`
set -e

run_in_terminal() {
    local dir=$1
    shift
    (cd "$dir" && exec "$@") &
}

run_in_terminal "apps/user-frontend" npm run dev
run_in_terminal "apps/admin-frontend" npm run dev
run_in_terminal "services/user-backend" npm run dev
run_in_terminal "services/admin-backend" npm run dev

# content-engine needs virtualenv
if [ -f "services/content-engine/.venv/bin/activate" ]; then
    run_in_terminal "services/content-engine" bash -lc "source .venv/bin/activate && python main.py"
else
    echo "warning: no .venv detected for content-engine" >&2
fi

wait
