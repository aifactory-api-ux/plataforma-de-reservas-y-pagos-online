# UI/UX Design Contract

> **READ THIS FILE BEFORE IMPLEMENTING ANY FRONTEND COMPONENT.**
> This is the single source of truth for all visual and functional requirements.

## Figma Source

File URL: https://www.figma.com/design/o6Dl2MCtCFVKnJcyVF2VL0

## Visual Direction

Interfaz deportiva móvil primero, clara y de alta legibilidad en verde y blanco: jerarquía centrada en cancha, horario y precio, botones grandes y feedback inmediato para completar la reserva con pago en menos de 2 minutos. Para jugadores se plantea un flujo ligero con navegación inferior, tarjetas amplias y estados visibles. Para encargados y administradores se plantea un sistema de trabajo denso, desktop-first, con grilla por cancha y bloques horarios, donde cada estado de reserva tiene color, etiqueta e icono: retenida, pagada, cancelada, asistió y no asistió. La fotografía deportiva real y una tipografía display condensada aportan energía, sin sacrificar claridad de datos. Supuestos menores: el jugador opera prioritariamente desde móvil; encargados, profesores y administradores operan desde escritorio; el color de estado siempre se refuerza con texto e icono.

## Pages / Figma Frames

### 1. Login
- **node_id**: 2:96
- **purpose**: Acceso inicial para los cuatro roles.
- **sections**: ['Encabezado con marca y contexto de sedes', 'Formulario de inicio de sesión por correo', 'Acceso con Google Sign-In', 'Recuperación de contraseña', 'Mensajes de validación y error']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007001930-Login-default.png

### 2. Buscar cancha
- **node_id**: 2:126
- **purpose**: Consulta de disponibilidad en tiempo real para el jugador.
- **sections**: ['Encabezado con selector de sede', 'Filtros de deporte, fecha y rango horario', 'Listado o grilla de canchas disponibles', 'Tarjeta de horario disponible con precio', 'Indicador de cancha no disponible', 'Resumen del bloqueo temporal de 10 minutos']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007002406-Buscar_cancha-default.png

### 3. Pago
- **node_id**: 3:2
- **purpose**: Checkout y pago en línea con opción de dividir.
- **sections**: ['Resumen de sede, cancha, fecha y hora', 'Datos de contacto y jugadores invitados', 'Selector de pago dividido', 'Resumen de total y cargos', 'Botón de pago y aviso de redirección a Webpay', 'Estados de pago en curso, confirmado y fallido', 'Contador de retención de cancha']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007002928-Pago-default.png

### 4. Mis reservas
- **node_id**: 4:2
- **purpose**: Gestión de reservas del jugador.
- **sections**: ['Listado de reservas futuras', 'Tarjeta de reserva con estado visible', 'Acciones de reagendar y cancelar', 'Reservas pasadas', 'Alerta de inasistencia y bloqueo', 'Detalle de reserva y datos de sede']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007003381-Mis_reservas-default.png

### 5. Agenda de sede
- **node_id**: 5:7
- **purpose**: Panel operativo del encargado por cancha y horario.
- **sections**: ['Selector de sede, fecha y turno', 'Dashboard resumido de ocupación', 'Grilla densa por cancha y bloques horarios', 'Leyenda de estados', 'Ficha rápida de reserva', 'Acciones: confirmar, cancelar, marcar asistencia o inasistencia']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007003930-Agenda_de_sede-default.png

### 6. Reserva presencial
- **node_id**: 7:2
- **purpose**: Creación de reserva en sede con pago presencial.
- **sections**: ['Selector de cancha, fecha y hora', 'Datos del jugador', 'Tipo de pago presencial', 'Confirmación de disponibilidad', 'Registro de pago en efectivo o transferencia', 'Confirmación y opciones de notificación']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007004460-Reserva_presencial-default.png

### 7. Mis clases
- **node_id**: 10:2
- **purpose**: Convertir la página existente “Mis clases” en la Configuración del administrador para gestionar sedes, canchas, horarios y tarifas por franja valle y punta. Las clases dejan de ser prioridad en esta pantalla.
- **sections**: ['Sedes', 'Canchas', 'Horarios y bloques reservables', 'Tarifas por franja valle y punta']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007005008-Mis_clases-default.png

### 8. Panel admin
- **node_id**: 9:55
- **purpose**: Supervisión ejecutiva de ingresos, ocupación e inasistencias.
- **sections**: ['Selectores de período y sede', 'KPIs de ingresos, ocupación e inasistencias', 'Gráfico de ocupación por sede y tipo de cancha', 'Listado de transacciones recientes', 'Exportación a Excel', 'Alertas de no-show y bloqueos']
- **screenshot_object_name**: a9fa5bed-548c-430a-821c-d818b99da719/UIUX/1792007005562-Panel_admin-default.png

## Design Tokens

```json
{
  "radii": {
    "lg": "16px",
    "md": "12px",
    "sm": "8px",
    "xl": "24px",
    "pill": "999px"
  },
  "colors": {
    "brand": {
      "green_50": "#EDF9F1",
      "green_100": "#D9F4E3",
      "green_300": "#7DD3A4",
      "green_500": "#1C9A58",
      "green_600": "#14804A",
      "green_700": "#0F6B3C",
      "green_800": "#0F4C2C",
      "green_900": "#0B3B22",
      "green_950": "#06281A"
    },
    "neutral": {
      "white": "#FFFFFF",
      "border": "#DCE7E0",
      "overlay": "rgba(6, 40, 26, 0.45)",
      "surface": "#FFFFFF",
      "background": "#F4F8F5",
      "text_muted": "#647A6F",
      "text_primary": "#10241A",
      "border_strong": "#C3D3CA",
      "surface_subtle": "#F7FAF8",
      "text_secondary": "#40564A"
    },
    "semantic": {
      "info": "#1565C0",
      "focus": "#1C9A58",
      "danger": "#C62828",
      "success": "#1C9A58",
      "warning": "#F2A900"
    },
    "reservation_status": {
      "pagada": {
        "fill": "#D9F4E3",
        "icon": "check_circle",
        "text": "#0B3B22",
        "label": "Pagada",
        "border": "#1C9A58"
      },
      "asistio": {
        "fill": "#DCEFE2",
        "icon": "user_check",
        "text": "#0B3B22",
        "label": "Asisti\u00f3",
        "border": "#2E7D4F"
      },
      "retenida": {
        "fill": "#FFF4D6",
        "icon": "clock",
        "text": "#8A5A00",
        "label": "Retenida",
        "border": "#F2A900"
      },
      "cancelada": {
        "fill": "#FDE7E7",
        "icon": "x_circle",
        "text": "#7A1F1F",
        "label": "Cancelada",
        "border": "#C62828"
      },
      "no_asistio": {
        "fill": "#ECEFF1",
        "icon": "user_x",
        "text": "#303A35",
        "label": "No asisti\u00f3",
        "border": "#5A6460"
      }
    }
  },
  "motion": {
    "loading": "skeleton con pulso de opacidad 1.0 a 0.55",
    "agenda_update": "el cambio de estado usa un pulso de color de 300ms para dirigir la atenci\u00f3n del encargado.",
    "reduce_motion": "respetar prefers-reduced-motion y desactivar desplazamientos y pulsos.",
    "page_transition": "250ms ease-out",
    "micro_interaction": "150-200ms ease-out"
  },
  "imagery": {
    "style": "fotograf\u00eda deportiva real, luz natural, alto contraste, foco en canchas, jugadores en acci\u00f3n y superficies verdes; evitar archivos gen\u00e9ricos de banco.",
    "overlay": "opcional degradado verde 900 a transparente para legibilidad del texto sobre imagen.",
    "ratio_card": "4:3",
    "ratio_primary": "16:9"
  },
  "shadows": {
    "card": "0 1px 2px rgba(16, 36, 26, 0.06), 0 8px 24px rgba(16, 36, 26, 0.08)",
    "modal": "0 12px 32px rgba(16, 36, 26, 0.22)",
    "card_hover": "0 4px 8px rgba(16, 36, 26, 0.08), 0 16px 32px rgba(16, 36, 26, 0.12)",
    "focus_ring": "0 0 0 3px rgba(28, 154, 88, 0.28)",
    "sticky_header": "0 2px 8px rgba(16, 36, 26, 0.08)"
  },
  "spacing": {
    "space_1": "4px",
    "space_2": "8px",
    "space_3": "12px",
    "space_4": "16px",
    "space_5": "20px",
    "space_6": "24px",
    "space_8": "32px",
    "space_10": "40px",
    "space_12": "48px",
    "space_16": "64px",
    "page_gutter_mobile": "16px",
    "page_gutter_desktop": "32px"
  },
  "typography": {
    "scale": [
      {
        "name": "display",
        "size": "40px",
        "family": "display",
        "weight": "700",
        "line_height": "44px",
        "letter_spacing": "0.01em"
      },
      {
        "name": "h1",
        "size": "28px",
        "family": "display",
        "weight": "700",
        "line_height": "32px",
        "letter_spacing": "0.01em"
      },
      {
        "name": "h2",
        "size": "22px",
        "family": "display",
        "weight": "700",
        "line_height": "28px",
        "letter_spacing": "0.01em"
      },
      {
        "name": "h3",
        "size": "18px",
        "family": "body",
        "weight": "600",
        "line_height": "24px",
        "letter_spacing": "0"
      },
      {
        "name": "body_large",
        "size": "16px",
        "family": "body",
        "weight": "400",
        "line_height": "24px",
        "letter_spacing": "0"
      },
      {
        "name": "body",
        "size": "14px",
        "family": "body",
        "weight": "400",
        "line_height": "20px",
        "letter_spacing": "0"
      },
      {
        "name": "body_small",
        "size": "12px",
        "family": "body",
        "weight": "400",
        "line_height": "16px",
        "letter_spacing": "0"
      },
      {
        "name": "label",
        "size": "12px",
        "family": "body",
        "weight": "600",
        "line_height": "14px",
        "letter_spacing": "0.06em"
      },
      {
        "name": "button",
        "size": "16px",
        "family": "body",
        "weight": "700",
        "line_height": "20px",
        "letter_spacing": "0"
      },
      {
        "name": "numeric_agenda",
        "size": "12px",
        "family": "numeric",
        "weight": "600",
        "line_height": "16px",
        "letter_spacing": "0"
      }
    ],
    "families": {
      "body": "'Inter', 'Roboto', system-ui, sans-serif",
      "display": "'Barlow Condensed', 'Oswald', sans-serif",
      "numeric": "'Inter', 'Roboto Mono', monospace"
    }
  },
  "breakpoints": {
    "mobile": "0-639px",
    "tablet": "640-1023px",
    "desktop": "1024px+"
  },
  "iconography": {
    "color": "heredan tono de texto; estados ocupan color sem\u00e1ntico con etiqueta.",
    "style": "\u00edconos de l\u00ednea redondeados, trazo 1.75px, tama\u00f1o est\u00e1ndar 24px en 24px de zona t\u00e1ctil; en agendas densas tama\u00f1o 16px.",
    "usage": "usar iconos para deporte, sede, horario, pago, estado y acciones repetidas."
  },
  "accessibility": {
    "focus": "anillo de foco visible de 3px verde en todos los controles interactivos.",
    "density": "en grilla de agenda, mantener filas de al menos 44px y textos de 12px m\u00ednimo.",
    "contrast": "contraste m\u00ednimo 4.5:1 para texto normal y 3:1 para texto grande; validar en verde y \u00e1mbar sobre blanco.",
    "touch_target": "m\u00ednimo 48x48px para acciones t\u00e1ctiles m\u00f3viles.",
    "status_communication": "ning\u00fan estado se comunica solo con color; siempre incluye etiqueta e icono."
  }
}
```

## Base Components

### `NavegacionPrincipal`

Props:
```json
[
  "items: Array<{ label: string; icon: string; route: string }>",
  "activeRoute: string",
  "role: 'jugador' | 'encargado' | 'profesor' | 'administrador'",
  "onSelect: (route: string) => void"
]
```

### `BotonAccionPrincipal`

Props:
```json
[
  "label: string",
  "variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'",
  "size?: 'sm' | 'md' | 'lg'",
  "loading?: boolean",
  "disabled?: boolean",
  "fullWidth?: boolean",
  "leftIcon?: string",
  "rightIcon?: string"
]
```

### `TarjetaResumen`

Props:
```json
[
  "title: string",
  "subtitle?: string",
  "status?: ReservationStatus",
  "image?: string",
  "price?: number",
  "meta?: string[]",
  "actions?: React.ReactNode[]",
  "onClick?: () => void"
]
```

### `BadgeEstado`

Props:
```json
[
  "status: ReservationStatus",
  "showLabel?: boolean",
  "size?: 'sm' | 'md'"
]
```

### `SelectorDeporteFecha`

Props:
```json
[
  "sedes: Sede[]",
  "deportes: Deporte[]",
  "fecha: Date",
  "rangoHorario?: string",
  "onChange: (filters: Filters) => void"
]
```

### `FilaDisponibilidad`

Props:
```json
[
  "courtName: string",
  "time: string",
  "price: number",
  "available: boolean",
  "onSelect: () => void"
]
```

### `AgendaGrilla`

Props:
```json
[
  "date: Date",
  "sede: Sede",
  "courts: Court[]",
  "reservations: Reservation[]",
  "onSelectReservation: (id: string) => void"
]
```

### `ContadorRetencion`

Props:
```json
[
  "minutes: number",
  "seconds: number",
  "variant?: 'compact' | 'full'"
]
```

### `ModalConfirmacion`

Props:
```json
[
  "open: boolean",
  "title: string",
  "description: string",
  "confirmLabel: string",
  "cancelLabel?: string",
  "tone?: 'success' | 'warning' | 'danger'",
  "onConfirm: () => void"
]
```


## Preliminary Spec

```json
{
  "status": "complete",
  "audience": "jugadores que reservan y pagan, encargados de sede que gestionan agendas y pagos, profesores de p\u00e1del que publican clases, administradores de red que configuran y supervisan",
  "site_goal": "Plataforma de reservas y pagos online para una red de 2 complejos deportivos en Santiago, que permita a los jugadores reservar canchas de p\u00e1del y f\u00fatbol 7 con pago en l\u00ednea, y al personal gestionar la agenda de ambas sedes, resolviendo problemas de doble reserva e inasistencias.",
  "brand_tone": "Deportivo y claro, en verde y blanco, pensado para que los jugadores reserven desde el celular con botones grandes. Para el encargado de sede, la agenda tiene que ser una grilla densa por cancha, r\u00e1pida de leer, con colores por estado de la reserva: retenida, pagada, cancelada, asisti\u00f3 y no asisti\u00f3.",
  "last_asked": null,
  "constraints": [],
  "assumed_items": [],
  "item_attempts": {
    "tono": 2,
    "audiencia": 1,
    "pantallas": 2
  },
  "open_questions": [],
  "confirmed_items": [
    "audiencia",
    "pantallas",
    "tono"
  ],
  "gaps_to_resolve": [],
  "ready_for_phase_2": true,
  "sections_or_pages": [
    "Login",
    "Buscar cancha",
    "Pago",
    "Mis reservas",
    "Agenda de sede",
    "Reserva presencial",
    "Mis clases",
    "Panel admin",
    "Configuraci\u00f3n",
    "Devoluciones y personal."
  ],
  "visual_references": [],
  "last_asked_options": null,
  "confirmed_assumptions": []
}
```

## Last Refinement Notes

```json
{
  "structural": {
    "action": "rebuild_page",
    "purpose": "Convertir la p\u00e1gina existente \u201cMis clases\u201d en la Configuraci\u00f3n del administrador para gestionar sedes, canchas, horarios y tarifas por franja valle y punta. Las clases dejan de ser prioridad en esta pantalla.",
    "sections": [
      "Sedes",
      "Canchas",
      "Horarios y bloques reservables",
      "Tarifas por franja valle y punta"
    ],
    "page_name": "Mis clases"
  },
  "figma_status": "applied",
  "user_request": "Entonces reconstruye \"Mis clases\" como \"Configuraci\u00f3n\" del administrador: sedes, canchas, horarios y tarifas por franja valle y punta. Las clases son lo menos prioritario.",
  "patch_operations": []
}
```

## Figma Design Context (layout, spacing, component tree)

```json
{
  "success": true,
  "result": {
    "success": true,
    "action": "get_design_context",
    "auth_required": false,
    "message": "Retrieved React + TypeScript design context and screenshots for all 8 requested Figma nodes.",
    "figma": {
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0",
      "node_ids": [
        "2:96",
        "2:126",
        "3:2",
        "4:2",
        "5:7",
        "7:2",
        "10:2",
        "9:55"
      ]
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": "gpt-5.6-luna",
  "figma_tool_events": [
    {
      "tool": "list_mcp_resources",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": ""
    },
    {
      "tool": "list_mcp_resources",
      "status": "completed",
      "error": null,
      "text": "{\"server\":\"figma\",\"resources\":[{\"server\":\"figma\",\"uri\":\"ui://figma/codex.html\",\"name\":\"figma-codex-app\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/architecture-diagram-instructions.md\",\"name\":\"architecture-diagram-instructions\"},{\"server\":\"figma\",\"uri\":\"skill://index.json\",\"name\":\"skill-index\"},{\"server\":\"figma\",\"uri\":\"file://shader-runtime-index.json/\",\"name\":\"shader-runtime-index\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/add-custom-rules.md\",\"name\":\"add-custom-rules\",\"title\":\"add custom rules\",\"description\":\"Figma MCP docs: add custom rules\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/avoid-large-frames.md\",\"name\":\"avoid-large-frames\",\"title\":\"avoid large frames\",\"description\":\"Figma MCP docs: avoid large frames\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/bringing-make-context-to-your-agent.md\",\"name\":\"bringing-make-context-to-your-agent\",\"title\":\"bringing make context to your agent\",\"description\":\"Figma MCP docs: bringing make context to your agent\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/code-connect-integration.md\",\"name\":\"code-connect-integration\",\"title\":\"code connect integration\",\"description\":\"Figma MCP docs: code connect integration\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/code-to-canvas.md\",\"name\":\"code-to-canvas\",\"title\":\"code to canvas\",\"description\":\"Figma MCP docs: code to canvas\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/create-skills.md\",\"name\":\"create-skills\",\"title\":\"create skills\",\"description\":\"Figma MCP docs: create skills\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/generative-plugins-and-shaders.md\",\"name\":\"generative-plugins-and-shaders\",\"title\":\"generative plugins and shaders\",\"description\":\"Figma MCP docs: generative plugins and shaders\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/getting-500-error.md\",\"name\":\"getting-500-error\",\"title\":\"getting 500 error\",\"description\":\"Figma MCP docs: getting 500 error\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/images-stopped-loading.md\",\"name\":\"images-stopped-loading\",\"title\":\"images stopped loading\",\"description\":\"Figma MCP docs: images stopped loading\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/intro.md\",\"name\":\"intro\",\"title\":\"intro\",\"description\":\"Figma MCP docs: intro\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/local-server-installation.md\",\"name\":\"local-server-installation\",\"title\":\"local server installation\",\"description\":\"Figma MCP docs: local server installation\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/mcp-clients-issues.md\",\"name\":\"mcp-clients-issues\",\"title\":\"mcp clients issues\",\"description\":\"Figma MCP docs: mcp clients issues\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/mcp-vs-agent.md\",\"name\":\"mcp-vs-agent\",\"title\":\"mcp vs agent\",\"description\":\"Figma MCP docs: mcp vs agent\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/rate-limits-access.md\",\"name\":\"rate-limits-access\",\"title\":\"rate limits access\",\"description\":\"Figma MCP docs: rate limits access\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/remote-server-installation.md\",\"name\":\"remote-server-installation\",\"title\":\"remote server installation\",\"description\":\"Figma MCP docs: remote server installation\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/server-returning-web-code.md\",\"name\":\"server-returning-web-code\",\"title\":\"server returning web code\",\"description\":\"Figma MCP docs: server returning web code\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/structure-figma-file.md\",\"name\":\"structure-figma-file\",\"title\":\"structure figma file\",\"description\":\"Figma MCP docs: structure figma file\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/stuck-or-slow.md\",\"name\":\"stuck-or-slow\",\"title\":\"stuck or slow\",\"description\":\"Figma MCP docs: stuck or slow\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/tools-and-prompts.md\",\"name\":\"tools-and-prompts\",\"title\":\"tools and prompts\",\"description\":\"Figma MCP docs: tools and prompts\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/tools-not-loading.md\",\"name\":\"tools-not-loading\",\"title\":\"tools not loading\",\"description\":\"Figma MCP docs: tools not loading\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/trigger-specific-tools.md\",\"name\":\"trigger-specific-tools\",\"title\":\"trigger specific tools\",\"description\":\"Figma MCP docs: trigger specific tools\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/variables-vs-code.md\",\"name\":\"variables-vs-code\",\"title\":\"variables vs code\",\"description\":\"Figma MCP docs: variables vs code\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/write-effective-prompts.md\",\"name\":\"write-effective-prompts\",\"title\":\"write effective prompts\",\"description\":\"Figma MCP docs: write effective prompts\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"file://figma/docs/write-to-canvas.md\",\"name\":\"write-to-canvas\",\"title\":\"write to canvas\",\"description\":\"Figma MCP docs: write to canvas\",\"mimeType\":\"text/markdown\"},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-code-connect/SKILL.md\",\"name\":\"figma-code-connect\",\"title\":\"Skill: figma-code-connect\",\"description\":\"Creates and maintains Figma Code Connect template files that map Figma components to code snippets. Use when the user mentions Code Connect, Figma component mapping, design-to-code translation, or asks to create/update .figma.ts or .figma.js files.\",\"mimeType\":\"text/markdown\",\"size\":26669,\"_meta\":{\"size\":26669}},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-create-new-file/SKILL.md\",\"name\":\"figma-create-new-file\",\"title\":\"Skill: figma-create-new-file\",\"description\":\"Always use this skill when the user wants to create a new Figma Design, FigJam, or Slides file. You MUST invoke this skill BEFORE every `create_new_file` tool call.\",\"mimeType\":\"text/markdown\",\"size\":1841,\"_meta\":{\"size\":1841}},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-design-to-code/SKILL.md\",\"name\":\"figma-design-to-code\",\"title\":\"Skill: figma-design-to-code\",\"description\":\"**MANDATORY prerequisite** \u2014 you MUST invoke this skill BEFORE calling the `get_design_context` Figma MCP tool. You MUST trigger this skill whenever the user wants to implement, build, port, or code up a Figma design as code. Example prompts (not exhaustive) are 'implement this Figma design', 'build this screen from Figma', 'turn this Figma into code', 'design to code'. This skill provides critical instructions and steps to the agent on how to correctly implement Figma designs in code and must NOT be skipped.\",\"mimeType\":\"text/markdown\",\"size\":4066,\"_meta\":{\"size\":4066}},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-generate-design/SKILL.md\",\"name\":\"figma-generate-design\",\"title\":\"Skill: figma-generate-design\",\"description\":\"Use this skill alongside figma-use when the task involves translating an application page, view, or multi-section layout into Figma. Triggers: 'write to Figma', 'create in Figma from code', 'push page to Figma', 'take this app/page and build it in Figma', 'create a screen', 'build a landing page in Figma', 'update the Figma screen to match code', 'convert this modal/dialog/drawer/panel to Figma'. This is the preferred workflow skill whenever the user wants to build or update a full page, modal, dialog, drawer, sidebar, panel, form, dashboard, list, table, card, header, message preview, or other composed product UI in Figma from code or a description\u2014even when the user calls that composed UI a component. Discovers design system components, variables, and styles from Code Connect files, existing screens, and library search, then imports them and assembles views incrementally section-by-section using design system tokens instead of hardcoded values.\",\"mimeType\":\"text/markdown\",\"size\":39148,\"_meta\":{\"size\":39148}},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-generate-diagram/SKILL.md\",\"name\":\"figma-generate-diagram\",\"title\":\"Skill: figma-generate-diagram\",\"description\":\"MANDATORY prerequisite \u2014 load this skill BEFORE every `generate_diagram` tool call. NEVER call `generate_diagram` directly without loading this skill first. Trigger whenever the user asks to create, generate, draw, render, sketch, or build a diagram \u2014 flowchart, architecture diagram, sequence diagram, ERD or entity-relationship diagram, state diagram or state machine, gantt chart, or timeline. Also trigger when the user mentions Mermaid syntax or wants a system architecture, decision tree, dependency graph, API call flow, auth handshake, schema, or pipeline visualized in FigJam. Routes to type-specific guidance, sets universal Mermaid constraints, and tells you when to use a different diagram type or skip the tool entirely (mindmaps, pie charts, class diagrams, etc.).\",\"mimeType\":\"text/markdown\",\"size\":10272,\"_meta\":{\"size\":10272}},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-generate-library/SKILL.md\",\"name\":\"figma-generate-library\",\"title\":\"Skill: figma-generate-library\",\"description\":\"Build or update a professional-grade design system in Figma from a codebase. Use when the user wants to create variables/tokens, build component libraries, create individual components with proper variant sets and variable bindings, set up theming (light/dark modes), document foundations, or reconcile gaps between code and Figma. Also use when the user asks to create or generate any component in Figma \u2014 even a single one \u2014 since components require proper variable foundations, variant states, and design token bindings to be production-quality. This skill teaches WHAT to build and in WHAT ORDER \u2014 it complements the `figma-use` skill which teaches HOW to call the Plugin API. Both skills should be loaded together.\",\"mimeType\":\"text/markdown\",\"size\":24944,\"_meta\":{\"size\":24944}},{\"server\":\"figma\",\"uri\":\"skill://figma/figma-generative-plugins/SKILL.md\",\"name\":\"figma-generative-plugins\",\"title\":\"Skill: figma-generative-plugins\",\"description\":\"**MANDATORY prerequisite** \u2014 load this skill before calling `create_generative_plugi
```

## Figma Variable Definitions (token names + values)

```json
{
  "success": true,
  "result": {
    "success": true,
    "action": "get_variable_defs",
    "auth_required": false,
    "message": "Variable definitions retrieved for all requested nodes; none were returned.",
    "figma": {
      "variables": {
        "2:96": {},
        "2:126": {},
        "3:2": {},
        "4:2": {},
        "5:7": {},
        "7:2": {},
        "10:2": {},
        "9:55": {}
      }
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": "gpt-5.6-luna",
  "figma_tool_events": [
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nf3b28918-648c-40e5-bc3e-0c9fc47fe2d6\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nf3204da4-02df-4cc1-b8a6-00843335902b\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nf729d2b5-7453-46a1-a6a9-80c0af766d6c\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\n5033b4cd-9331-4723-9cc6-07f304c535c7\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nff7b2d69-f054-4596-9fc0-c6680c7f0344\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nf026cb78-523a-40e4-829d-f349490912ed\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nc6501d40-8720-4e95-af2d-a489205688b2\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_variable_defs",
      "status": "completed",
      "error": null,
      "text": "{}\nbba8b347-f242-4aab-8a2b-519f357d76a5\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    }
  ]
}
```

## Code Connect Map (Figma component → code file)

```json
{
  "success": true,
  "result": {
    "success": true,
    "action": "get_code_connect_map",
    "auth_required": false,
    "message": "Code Connect mappings retrieved; no mappings found for the requested nodes.",
    "figma": {
      "2:96": {},
      "2:126": {},
      "3:2": {},
      "4:2": {},
      "5:7": {},
      "7:2": {},
      "10:2": {},
      "9:55": {}
    }
  },
  "auth_required": false,
  "provider": "codex",
  "return_code": 0,
  "model": "gpt-5.6-luna",
  "figma_tool_events": [
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "in_progress",
      "error": null,
      "text": "",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\nbdaf88da-a161-458e-a194-808a7c925848\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\n57a8a88e-6720-4f17-86d7-bfbca0f3d56c\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\ne15c7bbc-61c4-4617-a04e-812b77243c78\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\n3c74edd8-30b0-4f11-a59e-ce14c6ad1902\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\n4a4a1c25-18ef-434b-9362-ad1a571fd6a3\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\n336fd5c2-3b7a-4dc0-a8d7-3eb6c6d092e0\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\n4e9d91c4-6542-48df-af6f-e4f810b6d3e4\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    },
    {
      "tool": "get_code_connect_map",
      "status": "completed",
      "error": null,
      "text": "{}\n21d999a0-d695-4915-9315-9602a2aabfdb\n",
      "file_key": "o6Dl2MCtCFVKnJcyVF2VL0"
    }
  ]
}
```

## Screenshots (workspace-relative paths)

- **Login**: `design/screenshots/Login.png`
- **Buscar cancha**: `design/screenshots/Buscar_cancha.png`
- **Pago**: `design/screenshots/Pago.png`
- **Mis reservas**: `design/screenshots/Mis_reservas.png`
- **Agenda de sede**: `design/screenshots/Agenda_de_sede.png`
- **Reserva presencial**: `design/screenshots/Reserva_presencial.png`
- **Mis clases**: `design/screenshots/Mis_clases.png`
- **Panel admin**: `design/screenshots/Panel_admin.png`
