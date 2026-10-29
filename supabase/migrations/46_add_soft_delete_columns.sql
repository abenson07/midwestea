alter table students add column if not exists deleted_at timestamptz;
alter table classes  add column if not exists deleted_at timestamptz;
