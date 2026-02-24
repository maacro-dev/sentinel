#!/usr/bin/bash

set -xe

DIR="supabase/migrations"

for file in "$DIR"/*.sql; do
    if [[ -f "$file" ]]; then
        pg_format \
            --inplace \
            --keyword-case 1 \
            --function-case 1 \
            --type-case 1 \
            --spaces 4 \
            --wrap-limit 120 \
            --wrap-comment \
            --nogrouping \
            --no-space-function \
            --redundant-parenthesis \
            --format-type \
            --wrap-after 1 \
            "$file"
    fi
done
