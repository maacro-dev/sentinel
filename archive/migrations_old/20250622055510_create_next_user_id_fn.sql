CREATE OR REPLACE FUNCTION next_user_id() RETURNS TEXT AS $$
DECLARE
  next_num INT;
BEGIN

  PERFORM pg_advisory_xact_lock(1234567890);

  SELECT COALESCE(MAX((SUBSTRING(user_id FROM 3))::INT), 0) + 1
    INTO next_num
    FROM users
   WHERE user_id LIKE 'DA%';

  RETURN 'DA' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
