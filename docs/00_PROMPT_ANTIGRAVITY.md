# 00 — Prompt Antigravity · Monedas · Momentos de Color

## PASO 1 — Copiar proyecto a ubicación estable

```powershell
$destino = "C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos"
Write-Host "Ya estás en la carpeta correcta: $destino"
```

> La carpeta ya existe en esa ruta. Abre **C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos** como workspace en Antigravity antes de pegar el prompt de construcción.

---

## PASO 2 — Prerequisitos

Verifica que tienes instalado:
- Node.js >= 18 (`node --version`)
- pnpm (`pnpm --version`) — si no: `npm i -g pnpm`
- Supabase CLI (`supabase --version`) — si no: `npm i -g supabase`

---

## PASO 3 — Prompt de construcción (rutas relativas — recomendado)

> Usar cuando Antigravity tiene abierta la carpeta `colorea-momentos` como workspace.

```
Eres un ingeniero full-stack experto en Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui y Supabase.

Vas a construir el sistema digital completo de "Monedas · Momentos de Color" — el programa de reconocimiento al talento humano de The Palace Company.

Lee primero estos archivos del workspace:
- docs/01_CONVOCATORIA.md   → reglas oficiales del programa
- docs/02_SPEC_SISTEMA.md   → especificación técnica (schema, lógica, pantallas)
- seed/colaboradores.csv    → padrón de colaboradores
- seed/comite_integrantes.csv → composición del comité
- seed/pilares.csv          → catálogo de pilares

CONTEXTO OPERATIVO CRÍTICO:
- Hay dos mesas separadas: mesa alta (nomina) y comité (vota). Son roles diferentes.
- Pilares: selección múltiple, mínimo 1, máximo 3. Nunca forzar uno solo.
- Impacto es OPCIONAL pero su ausencia sube riesgo_sesgo +25 (visible, no bloqueante).
- Foto es OPCIONAL pero si se adjunta, la descripción de qué se ve es OBLIGATORIA (constraint en DB).
- Comprimir imágenes a ≤1600px en el navegador antes de subir (OffscreenCanvas + convertToBlob webp 0.82).
- Cuota diferenciada: Taller y Operaciones → 2 nom/mes; resto → 1.
- Inhabilitación de comité: automática si el integrante es nominado; pantalla propia para designar suplente.
- Quórum mínimo: 4 votantes válidos; si no se alcanza → ciclo en estado nulo.
- Votación Borda 3-2-1: cada puntaje solo se usa una vez por integrante por ciclo.

ENTREGABLES FASE 1:
1. supabase/migrations/001_schema_inicial.sql — schema completo con RLS
2. supabase/migrations/002_seed_data.sql — datos del catálogo (pilares, coordinaciones)
3. Aplicación Next.js 14 en /app con las 5 pantallas de docs/02_SPEC_SISTEMA.md
4. Componentes shadcn/ui para formulario, cards de votación y dashboard
5. Lógica de árbitro riesgo_sesgo en /lib/arbitro.ts
6. Edge function Supabase para inhabilitación automática en /supabase/functions/

Construye en orden: schema → seed → lógica → UI. Confirma cada paso antes de continuar.
```

---

## PASO 3-BIS — Prompt con rutas absolutas (plan B)

> Usar si Antigravity no reconoce el workspace o prefieres apuntar desde otro proyecto.

```
[igual que PASO 3 pero reemplaza las rutas relativas con:]
- C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos\docs\01_CONVOCATORIA.md
- C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos\docs\02_SPEC_SISTEMA.md
- C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos\seed\colaboradores.csv
- C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos\seed\comite_integrantes.csv
- C:\Users\rsantarosa\Documents\Proyectos\colorea-momentos\seed\pilares.csv
```

---

## Checklist de Aceptación — Fase 1

- [ ] Formulario nominación: pilares 1-3, hecho >=80 chars, impacto opcional con badge riesgo
- [ ] Cuota diferenciada visible y bloqueante al agotarse
- [ ] Upload foto con compresión a 1600px en cliente
- [ ] Descripción foto obligatoria si hay adjunto (validación frontend + constraint DB)
- [ ] riesgo_sesgo calculado y visible antes de enviar; alerta si >=60
- [ ] Pantalla inhabilitaciones: lista, designar suplente, quórum actual
- [ ] Audit log de designaciones de suplente
- [ ] Votación Borda 3-2-1: un puntaje por nominación, sin repetir puntaje en el ciclo
- [ ] Quórum: bloqueo de votación si menos de 4 válidos
- [ ] Dashboard distribución pilares por coordinación
- [ ] RLS: nominador ve solo sus nominaciones; comité ve todas las aceptadas; gerencia ve todo
