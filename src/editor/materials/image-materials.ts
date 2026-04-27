import auspiciousCloudUrl from '../../assets/new-year-stickers/auspicious-cloud.svg';
import calendarIconUrl from '../../assets/new-year-stickers/calendar-icon.svg';
import cartoonHorseUrl from '../../assets/new-year-stickers/cartoon-horse.svg';
import firecrackersUrl from '../../assets/new-year-stickers/firecrackers.svg';
import fireworksUrl from '../../assets/new-year-stickers/fireworks.svg';
import fuCharacterUrl from '../../assets/new-year-stickers/fu-character.svg';
import holidayIconUrl from '../../assets/new-year-stickers/holiday-icon.svg';
import lanternUrl from '../../assets/new-year-stickers/lantern.svg';
import redEnvelopeUrl from '../../assets/new-year-stickers/red-envelope.svg';
import starsUrl from '../../assets/new-year-stickers/stars.svg';
import streamersUrl from '../../assets/new-year-stickers/streamers.svg';
import yearOfHorseLetteringUrl from '../../assets/new-year-stickers/year-of-horse-lettering.svg';

export interface ImageMaterialDefinition {
  id: string;
  name: string;
  componentType: 'Image';
  previewSrc: string;
  props: {
    src: string;
    alt: string;
    objectFit: 'contain';
  };
}

export const IMAGE_MATERIALS: ImageMaterialDefinition[] = [
  {
    id: 'lantern',
    name: '\u706f\u7b3c',
    componentType: 'Image',
    previewSrc: lanternUrl,
    props: { src: lanternUrl, alt: '\u65b0\u5e74\u706f\u7b3c\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'fireworks',
    name: '\u70df\u82b1',
    componentType: 'Image',
    previewSrc: fireworksUrl,
    props: { src: fireworksUrl, alt: '\u65b0\u5e74\u70df\u82b1\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'firecrackers',
    name: '\u97ad\u70ae',
    componentType: 'Image',
    previewSrc: firecrackersUrl,
    props: { src: firecrackersUrl, alt: '\u65b0\u5e74\u97ad\u70ae\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'red-envelope',
    name: '\u7ea2\u5305',
    componentType: 'Image',
    previewSrc: redEnvelopeUrl,
    props: { src: redEnvelopeUrl, alt: '\u65b0\u5e74\u7ea2\u5305\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'auspicious-cloud',
    name: '\u7965\u4e91',
    componentType: 'Image',
    previewSrc: auspiciousCloudUrl,
    props: { src: auspiciousCloudUrl, alt: '\u7965\u4e91\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'fu-character',
    name: '\u798f\u5b57',
    componentType: 'Image',
    previewSrc: fuCharacterUrl,
    props: { src: fuCharacterUrl, alt: '\u798f\u5b57\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'cartoon-horse',
    name: '\u5c0f\u9a6c\u5361\u901a',
    componentType: 'Image',
    previewSrc: cartoonHorseUrl,
    props: { src: cartoonHorseUrl, alt: '\u5c0f\u9a6c\u5361\u901a\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'year-of-horse-lettering',
    name: '\u9a6c\u5e74\u827a\u672f\u5b57',
    componentType: 'Image',
    previewSrc: yearOfHorseLetteringUrl,
    props: { src: yearOfHorseLetteringUrl, alt: '\u9a6c\u5e74\u827a\u672f\u5b57\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'stars',
    name: '\u661f\u661f',
    componentType: 'Image',
    previewSrc: starsUrl,
    props: { src: starsUrl, alt: '\u661f\u661f\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'streamers',
    name: '\u5f69\u5e26',
    componentType: 'Image',
    previewSrc: streamersUrl,
    props: { src: streamersUrl, alt: '\u5f69\u5e26\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'calendar-icon',
    name: '\u65e5\u5386\u56fe\u6807',
    componentType: 'Image',
    previewSrc: calendarIconUrl,
    props: { src: calendarIconUrl, alt: '\u65e5\u5386\u56fe\u6807\u8d34\u7eb8', objectFit: 'contain' },
  },
  {
    id: 'holiday-icon',
    name: '\u653e\u5047\u5c0f\u56fe\u6807',
    componentType: 'Image',
    previewSrc: holidayIconUrl,
    props: { src: holidayIconUrl, alt: '\u653e\u5047\u56fe\u6807\u8d34\u7eb8', objectFit: 'contain' },
  },
];
