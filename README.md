# Batticaloa Tourist Information & Day-Visit Planner

Frontend (`public/`): HTML, CSS, vanilla JS, Leaflet from the cdnjs CDN. API (`server/`): Node, Express, MongoDB (Mongoose), JWT, bcrypt.

## Run
1. `cd server && npm install`
2. Copy `.env.example` to `.env`: set `MONGODB_URI`, a long random `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (10+ characters)
3. `npm run seed` (safe to re-run, see below)
4. `npm start`
5. Visitors: http://localhost:3000   Admin: http://localhost:3000/admin.html

## Behaviour
- Visitors need no account. Their plan (any number of places) is stored in their browser (localStorage) and can be copied or shared by link.
- Only the administrator signs in (`/api/admin/login`). Add, edit and delete require an admin token.
- The map uses real latitude/longitude. Places without coordinates are listed but not pinned, and the admin dashboard flags them.
- Plan distances are straight-line estimates between stops, not driving distances. No road routing is used.

## Seed script (non-destructive)
- Inserts places that do not exist. Existing places keep admin edits.
- Refreshes coordinates only for places not ticked "checked against a reliable source" in the admin form. Tick it to protect your own coordinates.
- Creates the admin if missing. Changes an existing admin password only with `npm run seed -- --reset-admin`.
- Existing tourist accounts in the `users` collection are no longer used and are not deleted.

## Coordinates
Verified: Batticaloa Fort, Batticaloa Gate (used for Gandhi Park), Kallady Bridge, Batticaloa Lighthouse, Pasikudah (town point), St. Mary's Cathedral (decoded from its published Plus Code).
Missing, add in admin: Palmyrah & Handloom Centre, Lagoon Eco-Learning Centre, Heritage Museum of Kattankudy, Sathrukondan Bird Sanctuary.

Security: bcrypt hashing, rate-limited sign-in, 2 hour tokens, only `public/` served, admin-entered text escaped on the public site, image paths validated. Use HTTPS in production.

## Map tiles
The public site loads OpenStreetMap tiles directly, which OSM allows only for light use. Tile requests send a referrer, and tiles can still be refused ("Access blocked" images) if the site is opened from a file or the tile policy is breached. For a public launch, use a keyed tile provider (for example MapTiler or Stadia Maps) and change the URL in `public/js/app.js` (`L.tileLayer`).


## Final location and map updates (20 October 2026)
- Four new place pins based on provided Google Maps URLs: museum (7.677114,81.7306668), Handloom Village (7.6921649,81.7218152), Sathurukondan Wetlands Bird Sanctuary (7.742074,81.666079), Batticaloa Lagoon (7.566667,81.683333).
- Important: The Google Maps link for Batticaloa Lagoon identifies the waterbody, **not** a specific Eco-Learning Centre. Its name and description were adjusted accordingly. Distances remain the proposal figures, not recalculated geodesic values.
- Pasikudah & Kalkudah Beaches data are unchanged as explicitly requested.
- Shared plan URL parsing no longer truncates to 5 places.
- Changed background tile provider to OpenStreetMap France HOT tiles. Subject to external service availability, access rules and internet; the change cannot guarantee an unblocked map. Provider usage: https://www.openstreetmap.fr/usage/
- If the database is already seeded, updating places.json alone does not update stored MongoDB records. Update four entries using the Admin panel or reseed a disposable development database.
