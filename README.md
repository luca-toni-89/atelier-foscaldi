# Atelier Foscaldi

Schlanker digitaler Werkkatalog für einen Künstler und einen Administrator. Kein Shop, keine Zahlungen, keine Benutzerverwaltung. Ein TypeScript Cloudflare Worker stellt die getrennte öffentliche/Admin-API bereit; D1 speichert Werke, Inhalte und Sessions, R2 die Originalbilder, Workers Static Assets das responsive Frontend.

## Funktionen

- Öffentliche Startseite, Biografie, veröffentlichte Galerie, Werkdetail, Status/Preis und vorbereitete E-Mail- sowie Telefonlinks
- Geschütztes, mobiles `/admin`: Suche, Werk-CRUD, Einzel-/Mehrfachupload, Entwurf/Veröffentlichung, Status und fixe Website-Inhalte
- Serverseitige monotone Objektnummern, D1-Fremdschlüssel, kontrolliertes R2-Löschen
- PBKDF2-Passwortprüfung, gehashte Session-IDs, HttpOnly/Secure/SameSite-Cookie, CSRF-Token, 12-Stunden-Sessions und Login-Sperre
- JPEG/PNG/WebP werden anhand der Binärsignatur geprüft (max. 12 MB). Browser berücksichtigen JPEG-EXIF-Ausrichtung bei Canvas-/Bilddarstellung automatisch. HEIC/HEIF wird bewusst mit einer verständlichen Export-als-JPEG-Meldung abgewiesen. Bilder werden ohne Verzerrung responsiv dargestellt; für rund 100 Werke bleiben bewusst die optimierten Originale in R2 (Cloudflare liefert sie gecacht).

## Voraussetzungen und lokale Installation

Node.js **20 oder neuer**, npm und ein kostenloses Cloudflare-Konto:

```bash
npm install
cp .dev.vars.example .dev.vars # falls die Beispieldatei vorhanden ist; alternativ Datei wie unten erstellen
npm run typecheck
npm test
npm run build
```

Da Secrets nie committed werden, lokal `.dev.vars` erstellen:

```dotenv
ADMIN_PASSWORD_HASH=<salt>:100000:<64-hex-zeichen>
SESSION_SECRET=<mindestens-32-zufällige-Zeichen>
```

Einen Hash erzeugen (das Passwort wird nur lokal abgefragt/als Umgebungsvariable verarbeitet):

```bash
read -s -p 'Neues Adminpasswort: ' PW; echo
SALT=$(openssl rand -hex 16)
HASH=$(PW="$PW" SALT="$SALT" node -e "const c=require('crypto');console.log(c.pbkdf2Sync(process.env.PW,process.env.SALT,100000,32,'sha256').toString('hex'))")
printf '%s:100000:%s\n' "$SALT" "$HASH"
unset PW HASH SALT
```

Lokale Ressourcen und Migration:

```bash
npx wrangler d1 migrations apply atelier-foscaldi-db --local
npm run dev
```

Dann `http://localhost:8787` und `/admin` öffnen. D1/R2 sind echte lokale Wrangler-Bindings, keine simulierte API.

## Cloudflare erstmalig verbinden und deployen

**Nie Passwort oder Token in Git schreiben.** Wrangler öffnet die Cloudflare-Anmeldung im Browser; das Cloudflare-Passwort wird dieser Anwendung nie mitgeteilt.

```bash
npx wrangler login
npx wrangler whoami
npx wrangler d1 create atelier-foscaldi-db
npx wrangler r2 bucket create atelier-foscaldi-images
```

Die von `d1 create` ausgegebene echte `database_id` in `wrangler.jsonc` statt `REPLACE_AFTER_CREATION` eintragen. Danach:

```bash
npx wrangler secret put ADMIN_PASSWORD_HASH
openssl rand -base64 48 | npx wrangler secret put SESSION_SECRET
npx wrangler d1 migrations apply atelier-foscaldi-db --remote
npm run typecheck && npm test && npm run build
npm run deploy
```

Die von Wrangler ausgegebene `https://atelier-foscaldi.<subdomain>.workers.dev`-Adresse und `/admin` im Browser prüfen. Eine erfundene ID darf niemals eingesetzt werden.

### Passwort ändern

Neuen PBKDF2-Wert mit obigem Hash-Befehl erstellen, dann:

```bash
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler d1 execute atelier-foscaldi-db --remote --command "DELETE FROM admin_sessions"
```

Das invalidiert bestehende Sitzungen. `SESSION_SECRET` ist für künftige Erweiterungen reserviert und muss dennoch zufällig gesetzt sein.

## Betrieb, GitHub und eigene Domain

Für Cloudflare **Workers Builds**: GitHub-Repository im Dashboard verbinden, Build-Befehl `npm run build`, Deploy-Befehl `npx wrangler deploy`; Secrets im Cloudflare-Dashboard setzen, niemals als Repository-Variable im Code. D1/R2 bleiben über `wrangler.jsonc` gebunden. Eine Domain später unter **Workers & Pages → atelier-foscaldi → Settings → Domains & Routes → Add Custom Domain** anbinden.

### Backup

D1 regelmässig exportieren:

```bash
mkdir -p backups
npx wrangler d1 export atelier-foscaldi-db --remote --output backups/atelier-foscaldi-$(date +%F).sql
```

R2 mit einem S3-kompatiblen Werkzeug (z. B. rclone) und einem **nur lokal gespeicherten**, eingeschränkten R2-API-Token sichern:

```bash
rclone sync cloudflare-r2:atelier-foscaldi-images backups/r2-images
```

Wiederherstellung zuerst in neue/geleerte Ressourcen testen:

```bash
npx wrangler d1 execute atelier-foscaldi-db --remote --file backups/atelier-foscaldi-DATUM.sql
rclone sync backups/r2-images cloudflare-r2:atelier-foscaldi-images
```

D1 und R2 gehören logisch zusammen; beide Sicherungen zeitnah nacheinander erstellen. Vor Produktion die Wiederherstellung in separaten Testressourcen üben.

## Datenmodell und API

`migrations/0001_initial.sql` enthält `artworks`, `artwork_images`, `site_content`, `admin_sessions`, `login_attempts` und eine nie rückwärts laufende Sequenz. Nur `visibility='published'` wird öffentlich gelesen. Schreibzugriffe verlangen Session und CSRF. Zeitangaben sind UTC/ISO-8601. Die Seed-Texte sind ausdrücklich im Admin zu ersetzen.

Wichtige Routen: `GET /api/public/site`, `GET /api/public/artworks`, `GET /api/public/artworks/:id`, `POST /api/admin/login`; authentifiziert: Werk-CRUD, `/artworks/:id/images`, `/site`, `/logout`.

## Tests und Grenzen

```bash
npm run typecheck
npm test
npm run build
```

Die Tests prüfen Schema-, Veröffentlichungs-, Preis-, Kontakt-, Upload- und Sicherheitsinvarianten. Vor Livegang zusätzlich die Checkliste und reale mobile Browser verwenden. Die Mehrfacherfassung verarbeitet jedes Werk separat: Erfolge bleiben markiert, Fehler können ohne doppeltes Anlegen erfolgreicher Einträge erneut versucht werden. Bildverkleinerung sollte vor Auswahl über die üblichen iOS-/Android-Fotofunktionen erfolgen; der Server erzwingt 12 MB. Diese bewusste Begrenzung vermeidet schwere Bildbibliotheken im Worker.
