// Line-art técnico de vista frontal, um por tipo de peça.
// Regras comuns: viewBox 0 0 120 140, stroke-width 3, fill none, currentColor.
const SVG_OPEN = '<svg viewBox="0 0 120 140" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';

const SKETCHES = {
  'T-shirt': `${SVG_OPEN}
  <path d="M46 24 C52 31 68 31 74 24 L88 28 L106 54 L96 64 L80 55 L80 124 L40 124 L40 55 L24 64 L14 54 L32 28 Z"/>
  <path d="M46 24 C52 34 68 34 74 24"/>
</svg>`,

  'Polo': `${SVG_OPEN}
  <path d="M46 24 C52 31 68 31 74 24 L88 28 L106 54 L96 64 L80 55 L80 124 L40 124 L40 55 L24 64 L14 54 L32 28 Z"/>
  <path d="M46 24 C52 18 68 18 74 24"/>
  <path d="M46 24 L56 36"/>
  <path d="M74 24 L64 36"/>
  <path d="M56 36 L56 52 L64 52 L64 36"/>
  <circle cx="60" cy="42" r="1.4" fill="currentColor"/>
  <circle cx="60" cy="48" r="1.4" fill="currentColor"/>
</svg>`,

  'Camisa': `${SVG_OPEN}
  <path d="M46 22 C52 28 68 28 74 22 L90 28 L104 46 L106 96 L92 98 L88 58 L88 124 L32 124 L32 58 L28 98 L14 96 L16 46 L30 28 Z"/>
  <path d="M46 22 L54 32 L60 37 L66 32 L74 22"/>
  <path d="M46 22 C52 16 68 16 74 22"/>
  <path d="M60 43 L60 118" stroke-dasharray="2 7"/>
  <path d="M14 89 L28 89"/>
  <path d="M92 89 L106 89"/>
</svg>`,

  'Sweat': `${SVG_OPEN}
  <path d="M46 24 C52 31 68 31 74 24 L88 30 L100 46 L102 100 L88 100 L84 60 L84 124 L36 124 L36 60 L32 100 L18 100 L20 46 L32 30 Z"/>
  <path d="M48 26 C54 34 66 34 72 26"/>
  <path d="M36 115 L84 115"/>
  <path d="M18 93 L32 93"/>
  <path d="M88 93 L102 93"/>
</svg>`,

  'Sweat capuz': `${SVG_OPEN}
  <path d="M42 28 C32 2 88 2 78 28"/>
  <path d="M47 25 C43 12 77 12 73 25"/>
  <path d="M46 24 C52 33 68 33 74 24 L88 30 L100 46 L102 100 L88 100 L84 60 L84 124 L36 124 L36 60 L32 100 L18 100 L20 46 L32 30 Z"/>
  <path d="M56 32 L55 42"/>
  <path d="M64 32 L65 42"/>
  <path d="M46 96 L74 96 L70 116 L50 116 Z"/>
  <path d="M36 115 L46 115"/>
  <path d="M74 115 L84 115"/>
</svg>`,

  'Casaco': `${SVG_OPEN}
  <path d="M46 24 L46 17 L74 17 L74 24 L88 30 L100 46 L102 100 L88 100 L84 60 L84 124 L36 124 L36 60 L32 100 L18 100 L20 46 L32 30 Z"/>
  <path d="M46 24 C52 31 68 31 74 24"/>
  <path d="M60 30 L60 124"/>
  <path d="M42 100 L50 110"/>
  <path d="M78 100 L70 110"/>
</svg>`,

  'Casaco capuz': `${SVG_OPEN}
  <path d="M42 28 C32 2 88 2 78 28"/>
  <path d="M47 25 C43 12 77 12 73 25"/>
  <path d="M46 24 C52 33 68 33 74 24 L88 30 L100 46 L102 100 L88 100 L84 60 L84 124 L36 124 L36 60 L32 100 L18 100 L20 46 L32 30 Z"/>
  <path d="M60 33 L60 124"/>
  <path d="M42 100 L50 110"/>
  <path d="M78 100 L70 110"/>
</svg>`,

  'Top': `${SVG_OPEN}
  <path d="M44 22 L48 40 C54 44 66 44 72 40 L76 22"/>
  <path d="M48 40 C42 44 38 48 38 54 L38 108 L82 108 L82 54 C82 48 78 44 72 40"/>
</svg>`,

  'Vestido': `${SVG_OPEN}
  <path d="M46 22 L50 34 M74 22 L70 34"/>
  <path d="M50 34 C56 38 64 38 70 34"/>
  <path d="M50 34 C43 38 41 44 41 50 L45 72 L30 124 L90 124 L75 72 L79 50 C79 44 77 38 70 34"/>
  <path d="M45 72 L75 72"/>
</svg>`,

  'Saia': `${SVG_OPEN}
  <path d="M38 34 L82 34 L82 44 L38 44 Z"/>
  <path d="M38 44 L26 118 L94 118 L82 44"/>
</svg>`,

  'Calças': `${SVG_OPEN}
  <path d="M38 22 L82 22 L82 32 L86 126 L68 126 L61 62 Q60 57 59 62 L52 126 L34 126 L38 32 Z"/>
  <path d="M38 32 L82 32"/>
  <path d="M60 32 C61 38 61 46 60 54"/>
</svg>`,

  'Calções': `${SVG_OPEN}
  <path d="M38 34 L82 34 L82 44 L86 90 L64 90 L60 70 L56 90 L34 90 L38 44 Z"/>
  <path d="M38 44 L82 44"/>
  <path d="M60 44 L60 62"/>
</svg>`,

  'Boxers': `${SVG_OPEN}
  <path d="M36 40 L84 40 L84 50 L86 82 L64 82 L60 68 L56 82 L34 82 L36 50 Z"/>
  <path d="M36 50 L84 50"/>
  <path d="M38 45 L82 45" stroke-dasharray="3 5" stroke-width="2"/>
  <path d="M60 50 L60 62"/>
</svg>`,

  'Macacão': `${SVG_OPEN}
  <path d="M46 30 L38 14"/>
  <path d="M74 30 L82 14"/>
  <path d="M46 30 L74 30 L74 56 L86 56 L88 126 L68 126 L61 80 Q60 76 59 80 L52 126 L32 126 L34 56 L46 56 Z"/>
  <path d="M34 62 L86 62"/>
  <path d="M52 38 L68 38 L68 48 L52 48 Z"/>
</svg>`,

  '_fallback': `${SVG_OPEN}
  <path d="M30 40 L90 40 L90 120 L30 120 Z"/>
  <path d="M45 40 L45 30 L75 30 L75 40"/>
</svg>`
};

