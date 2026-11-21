# Modelo de datos científicos de LIFFUC

## Alcance

La migración `init` conserva las siete tablas originales. La migración
`scientific_domain` añade el modelo científico sin editar esa migración ni
crear datos de ejemplo. Añade diez modelos nuevos: nueve entidades científicas
y una entidad bibliográfica. Amplía `Molecula`, que ya existía:

- `Especie`: nombre científico y datos taxonómicos básicos.
- `MuestraBotanica`: espécimen recolectado, voucher, herbario, colector,
  fecha, procedencia y parte vegetal.
- `IdentificacionBotanica`: determinación taxonómica versionable de una
  muestra, quién la identificó, método, fecha y si está vigente.
- `Extracto`: preparación obtenida a partir de una determinación específica,
  con método, solvente, condiciones, masas y rendimiento.
- `Fraccion`: producto de fraccionamiento de un extracto; puede derivar de
  otra fracción del mismo extracto.
- `Molecula`: conserva la entidad química del catálogo existente; no es una
  tabla nueva. Se amplía con identificadores opcionales SMILES, InChI, InChIKey
  y número CAS para distinguir identidad química de cada aislamiento.
- `Aislamiento`: evento de obtención de una molécula desde una fracción, con
  método, masa, pureza y código de muestra opcional.
- `CaracterizacionEstructural`: observación de una técnica sobre un
  aislamiento, con equipo, condiciones, interpretación y datos estructurados.
- `Bioensayo` y `ResultadoBioensayo`: protocolo/ensayo separado de cada
  medición o interpretación obtenida sobre un extracto, fracción o molécula.
- `ReferenciaBibliografica`: ficha bibliográfica reutilizable.

Las referencias se asocian muchos-a-muchos con las entidades científicas.
Prisma representa esas asociaciones mediante tablas relacionales con claves
foráneas. Las nuevas asociaciones usan IDs bibliográficos; el texto de
referencias heredado de `Molecula` se conserva por compatibilidad.

## Relaciones y procedencia

```text
Especie ──< IdentificacionBotanica >── MuestraBotanica
                    │
                    └──< Extracto ──< Fraccion ──< Aislamiento >── Molecula
                                      │                 │
                                      └──< Fraccion     └──< CaracterizacionEstructural

Bioensayo ──< ResultadoBioensayo >── exactamente uno de:
                                      Extracto | Fraccion | Molecula
```

Una muestra puede tener varias determinaciones históricas, pero como máximo
una vigente. El extracto conserva la determinación concreta utilizada como
origen, de modo que un cambio taxonómico posterior no reescribe la
interpretación de experimentos anteriores. El aislamiento separa el evento
experimental de la identidad química, que puede aparecer en varios
aislamientos.

Las cantidades se almacenan como `Decimal` y las unidades se conservan en
campos explícitos. Las fechas sin hora usan `DATE`. Los datos estructurales
específicos de cada técnica pueden guardarse como JSONB, mientras que técnica,
equipo, condiciones e interpretación siguen siendo campos consultables.

## Integridad

Además de claves foráneas e índices, la migración añade restricciones SQL que
Prisma no expresa directamente:

- coordenadas completas y dentro de rango;
- una sola identificación vigente por muestra;
- fracciones derivadas únicamente de otra fracción del mismo extracto;
- masas, rendimientos, pureza, concentraciones, replicados y fechas dentro de
  rangos coherentes;
- cada resultado asociado a exactamente un material de ensayo y con unidad
  para todo valor cuantitativo.

El servicio de identificaciones cambia la determinación vigente en una
transacción. El servicio de fracciones también valida la procedencia antes de
guardar; la clave foránea compuesta protege esa regla en PostgreSQL.

## API inicial

Las colecciones científicas requieren sesión autenticada para lectura y rol
`ADMIN` o `INVESTIGADOR` para escritura. Los `GET` aceptan `limit` (1–100,
predeterminado 50) y `cursor`; las escrituras validan el cuerpo y relaciones.

- `/api/especies`
- `/api/muestras-botanicas`
- `/api/identificaciones-botanicas`
- `/api/extractos`
- `/api/fracciones`
- `/api/aislamientos`
- `/api/caracterizaciones-estructurales`
- `/api/bioensayos`
- `/api/referencias`

Estas rutas implementan lectura paginada y creación inicial. Aún no hay
formularios de captura científica, operaciones de edición/borrado ni una
migración aplicada a una base de datos en este cambio.

## Compatibilidad y decisiones pendientes

No se renombra ni elimina el campo de texto `Molecula.especie`, ni el campo
legado de referencias en moléculas. La migración no convierte esos textos en
relaciones ni inventa registros taxonómicos. Los nuevos vínculos se realizan
por la cadena de muestra, determinación, extracto, fracción y aislamiento.

Antes de una carga masiva conviene acordar una autoridad taxonómica y el
tratamiento de sinónimos/nombres aceptados, además de convenciones de unidades,
códigos de muestra, técnicas espectroscópicas y atribución de responsables.
El modelo deja esos catálogos controlados abiertos deliberadamente; no crea
listas científicas supuestas.
