# TODO

- Finalize UI first before restarting development.


## Considerations

- Use batches/disabling on imports
    - Each form has a `batch_id` which is null by default
    - For every import, each row will be assigned with a batch_id
    - Analytics queries always filter `is_active`

    ### Maybe
    
        - Add a staging area to the imported file



