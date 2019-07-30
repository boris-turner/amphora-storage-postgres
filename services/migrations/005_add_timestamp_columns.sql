-- TODO: Potentially replace this with "moddatetime" extension. It needs superuser privileges.
CREATE OR REPLACE FUNCTION "public".update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
        NEW.updated_at = now();
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ language 'plpgsql';

DO $$DECLARE
    rec record;
    schema VARCHAR(50);
BEGIN
    FOREACH schema IN
        ARRAY ARRAY['public', 'components', 'layouts']
    LOOP
        FOR rec IN
            SELECT p.schemaname, p.tablename FROM pg_tables p WHERE p.schemaname = schema
        LOOP

        -- Ignore migrations table
        CONTINUE WHEN rec.schemaname = 'public' AND rec.tablename = 'migrations';

        EXECUTE 'ALTER TABLE "' || rec.schemaname || '"."' || rec.tablename || '" '
            'ADD COLUMN created_at TIMESTAMPTZ, '
            'ADD COLUMN updated_at TIMESTAMPTZ, '
            'ADD COLUMN last_published_at TIMESTAMPTZ, '
            'ADD COLUMN first_published_at TIMESTAMPTZ;';
        EXECUTE 'ALTER TABLE "' || rec.schemaname || '"."' || rec.tablename || '" '
            'ALTER COLUMN created_at SET DEFAULT now();';
        EXECUTE 'ALTER TABLE "' || rec.schemaname || '"."' || rec.tablename || '" '
            'ALTER COLUMN updated_at SET DEFAULT now();';
        EXECUTE 'CREATE TRIGGER update_updated_at '
            'BEFORE UPDATE ON "' || rec.schemaname || '"."' || rec.tablename || '" '
            'FOR EACH ROW EXECUTE PROCEDURE "public".update_updated_at_timestamp();';

        END LOOP;
    END LOOP;
END
$$ language 'plpgsql';
