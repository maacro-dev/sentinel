#!/usr/bin/bash

set -xe

pnpx supabase db reset && \
pnpx supabase gen types typescript --local --schema public,analytics > ./src/core/supabase/supabase.types.ts
