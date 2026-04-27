const ASSET_MAP = {
  'lantern.png': '/src/assets/new-year-stickers/lantern.svg',
  'lantern.svg': '/src/assets/new-year-stickers/lantern.svg',
  'fireworks.png': '/src/assets/new-year-stickers/fireworks.svg',
  'fireworks.svg': '/src/assets/new-year-stickers/fireworks.svg',
  'firecrackers.png': '/src/assets/new-year-stickers/firecrackers.svg',
  'firecrackers.svg': '/src/assets/new-year-stickers/firecrackers.svg',
  'red-envelope.png': '/src/assets/new-year-stickers/red-envelope.svg',
  'red-envelope.svg': '/src/assets/new-year-stickers/red-envelope.svg',
  'cloud.png': '/src/assets/new-year-stickers/auspicious-cloud.svg',
  'auspicious-cloud.svg': '/src/assets/new-year-stickers/auspicious-cloud.svg',
  'fu.png': '/src/assets/new-year-stickers/fu-character.svg',
  'fu-character.svg': '/src/assets/new-year-stickers/fu-character.svg',
  'horse.png': '/src/assets/new-year-stickers/cartoon-horse.svg',
  'cartoon-horse.svg': '/src/assets/new-year-stickers/cartoon-horse.svg',
  'year-of-horse.png': '/src/assets/new-year-stickers/year-of-horse-lettering.svg',
  'year-of-horse-lettering.svg': '/src/assets/new-year-stickers/year-of-horse-lettering.svg',
  'stars.png': '/src/assets/new-year-stickers/stars.svg',
  'stars.svg': '/src/assets/new-year-stickers/stars.svg',
  'streamers.png': '/src/assets/new-year-stickers/streamers.svg',
  'streamers.svg': '/src/assets/new-year-stickers/streamers.svg',
  'calendar.png': '/src/assets/new-year-stickers/calendar-icon.svg',
  'calendar-icon.svg': '/src/assets/new-year-stickers/calendar-icon.svg',
  'holiday.png': '/src/assets/new-year-stickers/holiday-icon.svg',
  'holiday-icon.svg': '/src/assets/new-year-stickers/holiday-icon.svg'
};

export function createDefaultRootNode() {
  return {
    id: 'root_page',
    type: 'Page',
    props: {
      preset: 'poster_story',
      backgroundColor: '#fff7e8'
    },
    position: {
      x: 0,
      y: 0,
      width: 1080,
      height: 1920
    }
  };
}

export function buildMockPosterNodes(prompt = '') {
  const title = extractTitle(prompt) || '新年快乐';
  const subtitle = extractSubtitle(prompt) || '元旦放假通知';

  return normalizePosterNodes([
    createDefaultRootNode(),
    {
      id: 'title_main',
      type: 'Title',
      props: {
        text: title,
        color: '#D4382A',
        fontSize: 88,
        fontWeight: 800,
        textAlign: 'center'
      },
      position: {
        x: 140,
        y: 180,
        width: 800,
        height: 120
      },
      parentId: 'root_page'
    },
    {
      id: 'title_sub',
      type: 'Title',
      props: {
        text: subtitle,
        color: '#F59E0B',
        fontSize: 42,
        fontWeight: 600,
        textAlign: 'center'
      },
      position: {
        x: 190,
        y: 330,
        width: 700,
        height: 80
      },
      parentId: 'root_page'
    },
    {
      id: 'sticker_lantern_left',
      type: 'Image',
      props: {
        src: '/src/assets/new-year-stickers/lantern.svg',
        alt: '灯笼',
        objectFit: 'contain'
      },
      position: {
        x: 92,
        y: 120,
        width: 160,
        height: 220
      },
      parentId: 'root_page'
    },
    {
      id: 'sticker_lantern_right',
      type: 'Image',
      props: {
        src: '/src/assets/new-year-stickers/lantern.svg',
        alt: '灯笼',
        objectFit: 'contain'
      },
      position: {
        x: 828,
        y: 120,
        width: 160,
        height: 220
      },
      parentId: 'root_page'
    }
  ]);
}

export function normalizePosterNodes(input) {
  if (!Array.isArray(input)) {
    throw new Error('Poster JSON must be an array of ComponentNode items.');
  }

  const normalizedNodes = input.map(normalizeNode);
  const hasRoot = normalizedNodes.some((node) => node?.id === 'root_page');
  return hasRoot ? normalizedNodes : [createDefaultRootNode(), ...normalizedNodes];
}

function normalizeNode(node) {
  const normalized = {
    ...node,
    props: {
      ...(node?.props || {})
    },
    position: {
      x: Number(node?.position?.x || 0),
      y: Number(node?.position?.y || 0),
      width: Number(node?.position?.width || 200),
      height: Number(node?.position?.height || 120),
      ...(node?.position?.zIndex !== undefined ? { zIndex: Number(node.position.zIndex) } : {})
    }
  };

  if (normalized.type === 'Title') {
    normalized.props.color = normalized.props.color || normalized.props.fontColor || '#D4382A';
    delete normalized.props.fontColor;
  }

  if (normalized.type === 'Image') {
    const mappedSrc = mapAssetSrc(normalized.props.src, normalized.props.alt);
    normalized.props.src = mappedSrc;
    normalized.props.alt = normalized.props.alt || '海报素材';
    normalized.props.objectFit = normalized.props.objectFit || 'contain';
  }

  if (normalized.type === 'Page') {
    normalized.props.backgroundColor = normalized.props.backgroundColor || '#fff7e8';
    normalized.props.preset = normalized.props.preset || 'poster_story';
  }

  return normalized;
}

function mapAssetSrc(src, alt) {
  const raw = String(src || '').trim().toLowerCase();
  if (raw && ASSET_MAP[raw]) {
    return ASSET_MAP[raw];
  }

  const altText = String(alt || '').toLowerCase();
  if (altText.includes('灯笼')) return ASSET_MAP['lantern.png'];
  if (altText.includes('烟花')) return ASSET_MAP['fireworks.png'];
  if (altText.includes('鞭炮')) return ASSET_MAP['firecrackers.png'];
  if (altText.includes('红包')) return ASSET_MAP['red-envelope.png'];
  if (altText.includes('祥云')) return ASSET_MAP['cloud.png'];
  if (altText.includes('福')) return ASSET_MAP['fu.png'];
  if (altText.includes('马')) return ASSET_MAP['horse.png'];
  if (altText.includes('星')) return ASSET_MAP['stars.png'];
  if (altText.includes('彩带')) return ASSET_MAP['streamers.png'];
  if (altText.includes('日历')) return ASSET_MAP['calendar.png'];
  if (altText.includes('放假')) return ASSET_MAP['holiday.png'];

  return ASSET_MAP['lantern.png'];
}

function extractTitle(prompt) {
  const trimmed = String(prompt || '').trim();
  if (!trimmed) return '';
  return trimmed.slice(0, 20);
}

function extractSubtitle(prompt) {
  const trimmed = String(prompt || '').trim();
  if (!trimmed) return '';
  return trimmed.length > 20 ? trimmed.slice(20, 36) : '';
}
