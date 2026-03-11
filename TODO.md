


add lowest yield and yield gap on [yield by location]







## todo

- import
    - kung mag add sa mobile app sang farmer kag field to an imported data, it must be updated
    - check if row (form type, mfid, season) is already present, ignore make a warning

- drill down on stat cards

- import

- user management flow (create, update)

## todo(ui)

- handle trend charts on blank slate (no date)

## fix

- barangay trend chart minimum height + no data ui

- data collection trend y-axix
  - make values a non-decimal
  - add space on the left in case of three digit values

- user management column filters on role and last sign in


## considerations

- use batches/disabling on imports
    - each form has a `batch_id` which is null by default
    - for every import, each row will be assigned with a batch_id
    - analytics queries always filter `is_active`

    ### maybe
        - add a staging area to the imported file

- create notification based on all the toasts that are shown

