import { WasteCategory } from '../types/waste';
import { MATERIALS_IMAGE, COMPOST_IMAGE } from '../assets/images';

export interface SampleWasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  description: string;
  imageUrl: string;
  aspectRatio: string;
}

export const SAMPLE_WASTE_ITEMS: SampleWasteItem[] = [
  {
    id: 'sample-cardboard',
    name: 'Corrugated Shipping Box',
    category: 'cardboard',
    description: 'Dry corrugated brown parcel box with taped seam, clean surface.',
    imageUrl: MATERIALS_IMAGE,
    aspectRatio: '4:3'
  },
  {
    id: 'sample-can',
    name: 'Aluminum Beverage Can',
    category: 'metal',
    description: 'Standard 330ml aluminum soda container, emptied and clean.',
    imageUrl: MATERIALS_IMAGE,
    aspectRatio: '4:3'
  },
  {
    id: 'sample-bottle',
    name: 'Green Glass Wine Bottle',
    category: 'glass',
    description: '750ml emerald container glass bottle with cap removed.',
    imageUrl: MATERIALS_IMAGE,
    aspectRatio: '4:3'
  },
  {
    id: 'sample-compost',
    name: 'Organic Kitchen Scraps',
    category: 'trash',
    description: 'Citrus peels, coffee grounds, and vegetable ends for composting.',
    imageUrl: COMPOST_IMAGE,
    aspectRatio: '4:3'
  }
];
