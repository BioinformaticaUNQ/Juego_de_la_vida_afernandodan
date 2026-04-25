🧬 FICHA TÉCNICA — “APURADA RIBOSÓMICA” (v2)
🎮 Género

Arcade en tiempo real (matching + reflejos)

🧠 Fantasía

Operar un ribosoma que traduce ARNm en vivo.

🎯 CONTRATO DE JUEGO
Input del sistema (lo que el jugador ve)
Codón actual (del ARNm)
Pool de ARNt (3–5 cartas)
Input del jugador (lo que puede hacer)
Elegir 1 ARNt y soltarlo en el sitio A
Regla central

anticodón (ARNt) complementa al codón → ✔
no complementa → ✖

🔁 CORE LOOP
Scroll ARNm → aparece codón → jugador elige ARNt → drop en A →
validación → (ok: agrega aa / fail: penaliza) → transloca → repetir
1 codón = 1 decisión = 1 aminoácido
⚙️ SISTEMAS
1) Flujo de ARNm (automático)
Tira de codones que avanza sola
Dirección: 5’ → 3’
Siempre hay un codón activo alineado con A
2) Ribosoma (automático)
Tres sitios funcionales:
A (entrada) — único interactivo
P (cadena)
E (salida)
Translocación por tick:
A → P → E → fuera
3) Input (jugador)
Drag & drop de 1 carta ARNt al sitio A
Ventana de tiempo limitada
4) Validación
Match codón–anticodón
✔ correcto → agrega aa + combo
✖ incorrecto → penaliza
⏱ timeout → penaliza y avanza
5) Progreso
Crece la cadena polipeptídica
Score y combo
🧩 COMPONENTES VISUALES
1) HUD SUPERIOR
Codón actual
Texto grande: AUG
Estilo: bold/condensada, caja oscura con glow
Anticodón esperado
Subtexto: anti: UAC (opcional para onboarding)
Color cian/verde
Timer
Barra horizontal (verde → amarillo → rojo)
Score / Combo
Derecha, minimal
2) RIBOSOMA (centro)
[E]   [P]   [A]
Slots
A: borde glow, dashed cuando vacío, drop zone
P: muestra ARNt con cadena unida
E: salida con fade
Animaciones
Drop → snap + glow
Enlace → transferencia visual (P→A)
Translocación → shift suave
3) ARNm (cadena entrante)
[AUG][GCU][UAC][AAU]...
Tiles con scroll automático
Codón activo centrado bajo A
Marca 5' → 3'
Colores por base
A: verde
U: rojo
G: amarillo
C: azul
4) ARNt DISPONIBLES (cartas)
Estructura
┌─────────┐
│  UAC    │  ← anticodón (grande)
│   🧬    │  ← ícono ARNt
│   ●     │  ← aminoácido (color)
└─────────┘
Propiedades
3–5 cartas visibles
Refresh dinámico
Drag & drop
Estados
Hover: glow + scale
Drag: follow cursor
Inválido: shake rojo
5) CADENA POLIPEPTÍDICA
●—●—●—●—○—○
Nodos (bolitas) = aminoácidos
Crece de izq → der
Animación: pop/bounce al agregar
6) FEEDBACK
✔ correcto: glow verde + sonido + “+combo” flotante
✖ error: shake + flash rojo
⏱ timeout: barra vacía + avance forzado
7) MANUAL (overlay)
Estilo: carta/paper cartoon
Contenido:
Regla base: AUG → UAC → Met
Tabla mínima (codón/anticodón/color)
Diagrama A/P/E
🎨 SISTEMA VISUAL
Fondo: oscuro con noise
Primario: cian (#00E0C6)
Secundario: amarillo (#FFD54F)
Error: rojo suave (#FF6B6B)
Tipos:
Títulos: condensada bold (Bebas/Anton)
UI: sans limpia
Bordes redondeados, glow sutil, sombras suaves
⚖️ REGLAS
Éxito
Insertar ARNt correcto antes del timer
Error
Mismatch o timeout
Scoring
Base por acierto
Multiplicador por combo
🎚️ PARÁMETROS DE DIFICULTAD
Velocidad de scroll del ARNm
Ventana de tiempo (timer)
Cantidad de cartas ARNt
Tasa de refresh del pool
Penalización por error
🧠 MODELO MENTAL FINAL
Juego: codón → Jugador: elige ARNt → Sistema: valida → Resultado: agrega aa
1 codón = 1 decisión
Flujo continuo, sin setup previo
📦 CHECKLIST DE IMPLEMENTACIÓN
Stream de ARNm (tiles + scroll)
Ribosoma con 3 slots (A/P/E)
Pool dinámico de cartas ARNt
Sistema de drag & drop
Validador codón–anticodón
Timer por acción
Renderer de cadena polipeptídica
Feedback visual/sonoro

Esto ya define qué ve el jugador, qué hace y cómo responde el sistema, junto con todos los componentes visuales necesarios para construir la UI y la lógica sin ambigüedad.