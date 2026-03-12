create or replace function import_data_transaction(
    p_dataset_type text,
    p_data jsonb,
    p_auto_create_mfid boolean default true
)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''
as $$
begin
    case p_dataset_type
        when 'field_plannings' then
            return public.import_field_plannings(p_data, p_auto_create_mfid);

        when 'harvest_records' then
            return public.import_harvest_records(p_data, p_auto_create_mfid);

        when 'crop_establishments' then
            return public.import_crop_establishments(p_data, p_auto_create_mfid);

        when 'damage_assessments' then
            return public.import_damage_assessments(p_data, p_auto_create_mfid);

        else
          raise exception 'Unsupported dataset type: %', p_dataset_type;
    end case;
end;
$$;
