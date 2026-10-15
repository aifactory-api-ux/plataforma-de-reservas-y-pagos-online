export const tokens = {
  colors: {
    brand: {
      green_950: '#06281A',
      green_900: '#0B3B22',
      green_800: '#0F4C2C',
      green_700: '#0F6B3C',
      green_600: '#14804A',
      green_500: '#1C9A58',
      green_300: '#7DD3A4',
      green_100: '#D9F4E3',
      green_50: '#EDF9F1'
    },
    neutral: {
      white: '#FFFFFF',
      surface: '#FFFFFF',
      background: '#F4F8F5',
      surface_subtle: '#F7FAF8',
      border: '#DCE7E0',
      border_strong: '#C3D3CA',
      text_primary: '#10241A',
      text_secondary: '#40564A',
      text_muted: '#647A6F',
      overlay: 'rgba(6, 40, 26, 0.45)'
    },
    semantic: {
      success: '#1C9A58',
      warning: '#F2A900',
      danger: '#C62828',
      info: '#1565C0',
      focus: '#1C9A58'
    },
    reservation_status: {
      retenida: {
        label: 'Retenida',
        fill: '#FFF4D6',
        border: '#F2A900',
        text: '#8A5A00',
        icon: 'clock'
      },
      pagada: {
        label: 'Pagada',
        fill: '#D9F4E3',
        border: '#1C9A58',
        text: '#0B3B22',
        icon: 'check_circle'
      },
      cancelada: {
        label: 'Cancelada',
        fill: '#FDE7E7',
        border: '#C62828',
        text: '#7A1F1F',
        icon: 'x_circle'
      },
      asistio: {
        label: 'Asistió',
        fill: '#DCEFE2',
        border: '#2E7D4F',
        text: '#0B3B22',
        icon: 'user_check'
      },
      no_asistio: {
        label: 'No asistió',
        fill: '#ECEFF1',
        border: '#5A6460',
        text: '#303A35',
        icon: 'user_x'
      }
    }
  },
  typography: {
    families: {
      display: "'Barlow Condensed', 'Oswald', sans-serif",
      body: "'Inter', 'Roboto', system-ui, sans-serif",
      numeric: "'Inter', 'Roboto Mono', monospace"
    },
    scale: [
      {
        name: 'display',
        family: 'display',
        size: '40px',
        line_height: '44px',
        weight: '700',
        letter_spacing: '0.01em'
      },
      {
        name: 'h1',
        family: 'display',
        size: '28px',
        line_height: '32px',
        weight: '700',
        letter_spacing: '0.01em'
      },
      {
        name: 'h2',
        family: 'display',
        size: '22px',
        line_height: '28px',
        weight: '700',
        letter_spacing: '0.01em'
      },
      {
        name: 'h3',
        family: 'body',
        size: '18px',
        line_height: '24px',
        weight: '600',
        letter_spacing: '0'
      },
      {
        name: 'body_large',
        family: 'body',
        size: '16px',
        line_height: '24px',
        weight: '400',
        letter_spacing: '0'
      },
      {
        name: 'body',
        family: 'body',
        size: '14px',
        line_height: '20px',
        weight: '400',
        letter_spacing: '0'
      },
      {
        name: 'body_small',
        family: 'body',
        size: '12px',
        line_height: '16px',
        weight: '400',
        letter_spacing: '0'
      },
      {
        name: 'label',
        family: 'body',
        size: '12px',
        line_height: '14px',
        weight: '600',
        letter_spacing: '0.06em'
      },
      {
        name: 'button',
        family: 'body',
        size: '16px',
        line_height: '20px',
        weight: '700',
        letter_spacing: '0'
      },
      {
        name: 'numeric_agenda',
        family: 'numeric',
        size: '12px',
        line_height: '16px',
        weight: '600',
        letter_spacing: '0'
      }
    ]
  },
  radii: {
    lg: '16px',
    md: '12px',
    sm: '8px',
    xl: '24px',
    pill: '999px'
  },
  shadows: {
    card: '0 1px 2px rgba(16, 36, 26, 0.06), 0 8px 24px rgba(16, 36, 26, 0.08)',
    modal: '0 12px 32px rgba(16, 36, 26, 0.22)',
    card_hover: '0 4px 8px rgba(16, 36, 26, 0.08), 0 16px 32px rgba(16, 36, 26, 0.12)',
    focus_ring: '0 0 0 3px rgba(28, 154, 88, 0.28)',
    sticky_header: '0 2px 8px rgba(16, 36, 26, 0.08)'
  },
  spacing: {
    space_1: '4px',
    space_2: '8px',
    space_3: '12px',
    space_4: '16px',
    space_5: '20px',
    space_6: '24px',
    space_8: '32px',
    space_10: '40px',
    space_12: '48px',
    space_16: '64px',
    page_gutter_mobile: '16px',
    page_gutter_desktop: '32px'
  },
  breakpoints: {
    mobile: '0-639px',
    tablet: '640-1023px',
    desktop: '1024px+'
  },
  motion: {
    loading: 'skeleton con pulso de opacidad 1.0 a 0.55',
    agenda_update: 'el cambio de estado usa un pulso de color de 300ms para dirigir la atención del encargado.',
    reduce_motion: 'respetar prefers-reduced-motion y desactivar desplazamientos y pulsos.',
    page_transition: '250ms ease-out',
    micro_interaction: '150-200ms ease-out'
  },
  imagery: {
    style: 'fotografía deportiva real, luz natural, alto contraste, foco en canchas, jugadores en acción y superficies verdes; evitar archivos genéricos de banco.',
    overlay: 'opcional degradado verde 900 a transparente para legibilidad del texto sobre imagen.',
    ratio_card: '4:3',
    ratio_primary: '16:9'
  },
  iconography: {
    color: 'heredan tono de texto; estados ocupan color semántico con etiqueta.',
    style: 'íconos de línea redondeados, trazo 1.75px, tamaño estándar 24px en 24px de zona táctil; en agendas densas tamaño 16px.',
    usage: 'usar iconos para deporte, sede, horario, pago, estado y acciones repetidas.'
  },
  accessibility: {
    focus: 'anillo de foco visible de 3px verde en todos los controles interactivos.',
    density: 'en grilla de agenda, mantener filas de al menos 44px y textos de 12px mínimo.',
    contrast: 'contraste mínimo 4.5:1 para texto normal y 3:1 para texto grande; validar en verde y ámbar sobre blanco.',
    touch_target: 'mínimo 48x48px para acciones táctiles móviles.',
    status_communication: 'ningún estado se comunica solo con color; siempre incluye etiqueta e icono.'
  }
};

export type TokenColorScheme = typeof tokens.colors;
export type TokenTypography = typeof tokens.typography;
export type TokenSpacing = typeof tokens.spacing;
