# Component Guide

Quick reference for components and design tokens. Use exact names — do not rename or create synonyms.

## Token Quick Reference

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
        "weight": 
```

## Available Components

- **NavegacionPrincipal**: 
- **BotonAccionPrincipal**: 
- **TarjetaResumen**: 
- **BadgeEstado**: 
- **SelectorDeporteFecha**: 
- **FilaDisponibilidad**: 
- **AgendaGrilla**: 
- **ContadorRetencion**: 
- **ModalConfirmacion**: 
