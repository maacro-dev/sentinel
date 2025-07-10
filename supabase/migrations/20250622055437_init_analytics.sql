create schema if not exists analytics;

create table analytics.field_season_summaries (
  field_id                    int not null references public.fields(id),
  season_year                 int not null,
  season_sem                  semester not null,
  completeness_score          smallint not null default 0,
  predicted_yield_kg_per_ha   double precision null,
  updated_at                  timestamptz not null default now(),
  primary key (field_id, season_year, season_sem),
  foreign key (season_year, season_sem) references public.seasons(year, sem)
);
