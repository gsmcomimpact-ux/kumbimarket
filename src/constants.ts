import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Montre en cuir minimaliste',
    description: 'Une pièce intemporelle avec un bracelet en cuir véritable et un cadran en cristal de saphir.',
    price: 85000,
    category: 'Accessoires',
    image: 'https://picsum.photos/seed/watch/600/600',
    stock: 15
  },
  {
    id: '2',
    name: 'Casque sans fil à réduction de bruit',
    description: 'Découvrez un son pur grâce à notre dernière technologie de réduction active du bruit.',
    price: 195000,
    category: 'Électronique',
    image: 'https://picsum.photos/seed/headphones/600/600',
    stock: 8
  },
  {
    id: '3',
    name: 'Sweat à capuche en coton bio',
    description: 'Sweat à capuche ultra-doux fabriqué à partir de coton 100% biologique certifié.',
    price: 45000,
    category: 'Vêtements',
    image: 'https://picsum.photos/seed/hoodie/600/600',
    stock: 25
  },
  {
    id: '4',
    name: 'Hub Domotique Intelligent',
    description: 'Contrôlez toute votre maison d\'un simple geste ou à la voix.',
    price: 95000,
    category: 'Électronique',
    image: 'https://picsum.photos/seed/hub/600/600',
    stock: 12
  },
  {
    id: '5',
    name: 'Chaise de bureau ergonomique',
    description: 'Conçue pour le confort pendant les longues heures de travail avec un soutien lombaire réglable.',
    price: 225000,
    category: 'Mobilier',
    image: 'https://picsum.photos/seed/chair/600/600',
    stock: 5
  },
  {
    id: '6',
    name: 'Machine à expresso portable',
    description: 'Préparez un expresso de qualité café partout où vous allez avec cet appareil compact.',
    price: 55000,
    category: 'Cuisine',
    image: 'https://picsum.photos/seed/coffee/600/600',
    stock: 20
  }
];
