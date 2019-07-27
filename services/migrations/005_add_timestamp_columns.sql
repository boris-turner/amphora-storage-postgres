ALTER TABLE "uris" ADD COLUMN created_at TIMESTAMPTZ,
    ADD COLUMN updated_at TIMESTAMPTZ,
    ADD COLUMN last_published_at TIMESTAMPTZ,
    ADD COLUMN first_published_at TIMESTAMPTZ;
ALTER TABLE "uris" ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE "uris" ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE "pages" ADD COLUMN created_at TIMESTAMPTZ,
    ADD COLUMN updated_at TIMESTAMPTZ,
    ADD COLUMN last_published_at TIMESTAMPTZ,
    ADD COLUMN first_published_at TIMESTAMPTZ;
ALTER TABLE "pages" ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE "pages" ALTER COLUMN updated_at SET DEFAULT now();
