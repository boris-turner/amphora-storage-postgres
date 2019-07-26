ALTER TABLE "uris" ADD COLUMN created_at TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP,
    ADD COLUMN last_published_at TIMESTAMP,
    ADD COLUMN first_published_at TIMESTAMP;
ALTER TABLE "uris" ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE "pages" ADD COLUMN created_at TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP,
    ADD COLUMN last_published_at TIMESTAMP,
    ADD COLUMN first_published_at TIMESTAMP;
ALTER TABLE "pages" ALTER COLUMN created_at SET DEFAULT now();
