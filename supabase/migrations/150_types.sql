create schema if not exists spatial;

create extension if not exists postgis schema spatial;

create extension if not exists pg_cron;

create type user_role as enum(
    'admin',
    'data_manager',
    'data_collector',
    'pending',
    'inactive'
);

create type gender as enum(
    'male',
    'female',
    'other'
);

create type verification_status as enum(
    'pending',
    'approved',
    'rejected',
    'unknown'
);

create type semester as enum(
    'first',
    'second'
);

create type irrigation_supply as enum(
    'Not Enough',
    'Not Sufficient',
    'Sufficient',
    'Excessive'
);

create type activity_type as enum(
    'field-data',
    'cultural-management',
    'nutrient-management',
    'crop_cut',
    'production',
    'monitoring-visit',
    'damage-assessment',
    'rice-non-rice'
);

create type harvesting_method as enum(
    'Manual',
    'Mechanical',
    'Other'
);
