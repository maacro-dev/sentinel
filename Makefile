
db:
	@supabase db reset && supabase gen types typescript --local --schema public > ./src/core/supabase/supabase.types.ts

db-types:
	@supabase gen types typescript --local --schema public > ./src/core/supabase/supabase.types.ts

restart:
	@supabase stop && supabase start && supabase functions serve

dev:
	@pnpm run dev

format-sql:
	@./format_sql.sh

fn:
	@supabase functions serve
