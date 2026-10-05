# Database migration deployment

SQL files in `supabase/migrations` are source-controlled database changes. The current GitHub CI only lints and builds the web app; it does **not** apply these migrations to the production Supabase project.

Before deploying a web build that depends on a new migration:

1. Apply all unapplied migrations to the production Supabase project in filename order.
2. Confirm the migration completed successfully.
3. Then deploy the matching `main` web build.

Recent features that require database migrations include the optional exam date, mastery learning states, automatic/device speech voice preferences, and atomic settings save.

Do not add a production database password, service-role key, access token, or project credential to this repository. If migration automation is added later, use protected GitHub/Vercel secrets and a dedicated deployment workflow.
