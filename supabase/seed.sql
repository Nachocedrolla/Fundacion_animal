-- supabase/seed.sql
INSERT INTO animales (nombre, especie, edad, historia, foto_url, destacado) VALUES
('Luna',   'perro', '2 años',   'Luna fue rescatada de la calle en invierno, desnutrida y asustada. Hoy es la más juguetona del refugio.', 'https://placedog.net/400/400?r=1', true),
('Thor',   'perro', '3 años',   'Thor llegó con una pata herida. Luego de su recuperación se convirtió en el perro más cariñoso que puedas imaginar.', 'https://placedog.net/400/400?r=2', true),
('Mochi',  'gato',  '1 año',    'Mochi fue encontrado en una caja de cartón. Pequeño pero lleno de vida y curiosidad.', 'https://placekitten.com/400/400', true),
('Panda',  'gato',  '4 años',   'Panda llegó lastimado y desconfiado. Hoy busca una familia que le dé el amor que merece.', 'https://placekitten.com/401/400', true),
('Canela', 'perro', '5 años',   'Canela fue abandonada con sus cachorros. Todos fueron adoptados menos ella. Sigue esperando su hogar.', 'https://placedog.net/400/400?r=3', true),
('Simón',  'perro', '6 meses',  'Simón es un cachorro lleno de energía que necesita una familia activa y mucho amor.', 'https://placedog.net/400/400?r=4', true),
('Nube',   'gato',  '2 años',   'Nube es tranquila, silenciosa y perfecta para un hogar que busca compañía sin mucho escándalo.', 'https://placekitten.com/402/400', true),
('Rex',    'perro', '7 años',   'Rex es un perro mayor que merece pasar sus últimos años en una familia que lo quiera como se merece.', 'https://placedog.net/400/400?r=5', true);

INSERT INTO testimonios (nombre, tipo, texto, destacado) VALUES
('Martina G.',     'adoptante',  'Adoptamos a Luna hace 6 meses y cambió nuestra familia para siempre. El proceso fue muy fácil y el refugio nos acompañó en todo momento.', true),
('Carlos y Sofía', 'adoptante',  'Cuando fuimos a buscar un perro no esperábamos encontrar tanto amor. Thor es parte de la familia desde el primer día.', true),
('Laura M.',       'voluntario', 'Ser voluntaria en Patitas Felices me enseñó más sobre la compasión de lo que aprendí en años. Recomiendo a todos que se sumen.', true),
('Rodrigo P.',     'donante',    'Dono todos los meses y sé que cada peso llega directamente a los animales. La transparencia del refugio es total.', true),
('Florencia T.',   'adoptante',  'Mochi llegó a casa y en una semana ya dormía en mi cama. Es lo mejor que me pasó en el año.', true),
('Equipo Devs AR', 'donante',    'Como empresa decidimos apoyar a Patitas Felices porque creemos en causas locales con impacto real. Los invitamos a sumarse.', true);
