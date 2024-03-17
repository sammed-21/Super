\echo 'Delete and recreate task db?'
\prompt 'Return for yes or control-C to cancel > ' answer

DROP DATABASE task;
CREATE DATABASE task;
\connect task

\i task-schema.sql
-- \i rate-my-setup-seed.sql


