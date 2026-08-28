CREATE TABLE IF NOT EXISTS site_sections (
  id INTEGER PRIMARY KEY CHECK(id=1),
  story_eyebrow TEXT NOT NULL,
  story_title TEXT NOT NULL,
  works_eyebrow TEXT NOT NULL,
  works_title TEXT NOT NULL,
  works_intro TEXT NOT NULL,
  contact_eyebrow TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  contact_text TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO site_sections VALUES(
  1,
  'Geschichte',
  'Über den Künstler',
  'Werkkatalog',
  'Ausgewählte Werke',
  'Ein persönlicher Einblick in ein künstlerisches Lebenswerk.',
  'Kontakt',
  'Ein Werk berührt Sie?',
  'Gerne geben wir persönlich Auskunft und erzählen Ihnen mehr über die verfügbaren Werke.',
  datetime('now')
);
