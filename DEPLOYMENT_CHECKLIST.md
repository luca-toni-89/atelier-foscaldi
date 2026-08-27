# Checkliste Erstveröffentlichung

- [ ] Node.js 20+ installiert, Repository geklont, `npm ci` ausgeführt
- [ ] `npx wrangler login` erfolgreich
- [ ] D1 `atelier-foscaldi-db` und R2 `atelier-foscaldi-images` erstellt
- [ ] echte D1-ID in `wrangler.jsonc` eingesetzt (keine Platzhalter-ID)
- [ ] `ADMIN_PASSWORD_HASH` und `SESSION_SECRET` als Wrangler Secrets gesetzt
- [ ] Migration remote ausgeführt
- [ ] `npm run typecheck && npm test && npm run build` erfolgreich
- [ ] `npm run deploy` ausgeführt und die ausgegebene `workers.dev`-Adresse geprüft
- [ ] `/admin`-Login, Werk-Upload, Veröffentlichung und Kontaktlinks geprüft
- [ ] Platzhaltertexte/Kontaktdaten unter **Website bearbeiten** ersetzt
- [ ] Backup-Termin für D1 und R2 festgelegt
