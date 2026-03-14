

## todo

- import
    - kung mag add sa mobile app sang farmer kag field to an imported data, it must be updated
    - check if row (form type, mfid, season) is already present, ignore make a warning

- user management flow (create, update)

- nutrient management table detail no fertilizer applications

## fix

- barangay trend chart minimum height + no data ui

- user management column filters on role and last sign in


## considerations

- import logging?

- use batches/disabling on imports
    - each form has a `batch_id` which is null by default
    - for every import, each row will be assigned with a batch_id
    - analytics queries always filter `is_active`

    ### maybe
        - add a staging area to the imported file

- create notification based on all the toasts that are shown

- drill down on stat cards
