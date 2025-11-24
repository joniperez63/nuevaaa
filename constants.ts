
import { Pet } from './types';

export const APP_NAME = "Nueva Vida Mendoza";

export const MOCK_PETS: Pet[] = [
  {
    id: 'misho-reset-1',
    name: 'Misho',
    age: 5,
    breed: 'Mestizo',
    type: 'cat',
    status: 'available',
    // Gato mestizo naranja con mirada tierna/triste
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop', 
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop', // Mirada triste
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop', // Panza arriba
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop'  // Primer plano
    ],
    bio: 'Soy Misho. He vivido mucho en la calle y estoy cansado. Mis ojos dicen todo lo que he pasado. Solo busco un lugarcito tranquilo y un poco de comida. ¿Podrías ser tú mi ángel?',
    personality: 'Melancholic, grateful, calm, gentle.',
    distance: 2,
    tags: ['Dormilón', 'Cariñoso', 'Tranquilo']
  },
  {
    id: 'luci-reset-1',
    name: 'Luci',
    age: 0.5, // Cachorra
    breed: 'Mestiza',
    type: 'cat',
    status: 'available',
    // Gatita gris pequeña y vulnerable
    image: 'https://images.unsplash.com/photo-1501820488136-72669149e0d4?q=80&w=800&auto=format&fit=crop', 
    images: [
      'https://images.unsplash.com/photo-1501820488136-72669149e0d4?q=80&w=800&auto=format&fit=crop', // Chiquita
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=800&auto=format&fit=crop', // Mirando arriba
      'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?q=80&w=800&auto=format&fit=crop'  // Curiosa
    ],
    bio: 'Me llamo Luci. Soy muy chiquita y el mundo es muy grande y asusta. Me encontraron solita tiritando. Prometo no molestar, solo quiero sentirme segura. ¿Me adoptas?',
    personality: 'Shy, sweet, needy, gentle.',
    distance: 4,
    tags: ['Juguetona', 'Curiosa', 'Tierna']
  }
];
