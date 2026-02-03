#!/usr/bin/bash

set -xe

supabase stop && supabase start && supabase functions serve
