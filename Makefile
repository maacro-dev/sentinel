
db:
	@supabase db reset && supabase gen types typescript --local --schema public > ./src/core/supabase/supabase.types.ts

db-types:
	@supabase gen types typescript --local --schema public > ./src/core/supabase/supabase.types.ts

restart:
	@supabase stop && supabase start

dev:
	@pnpm run dev

fn:
	@supabase functions serve

deploy-db:
	@supabase db reset && supabase gen types typescript --local --schema public > ./src/core/supabase/supabase.types.ts && supabase db reset --linked

deploy-fn:
	@supabase functions deploy

deploy: deploy-db deploy-fn
