        select 1
        from public.collection_details
        where collected_by = 5f998b6f-2724-4453-a8ec-d5017afd831e
          and (p_updated_after is null or updated_at > p_updated_after)