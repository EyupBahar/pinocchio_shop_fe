export const categories = [
  { id: 'all', nameKey: 'allProducts' },
  { id: 'single', nameKey: 'singleProduct' },
  { id: 'combination', nameKey: 'combination' },
]

export const products = [
  {
    id: 'oona-103-30',
    title: 'Sugo al pomodoro',
    categoryId: 'single',
    price: 89.0,
    image: '/src/assets/Sugo_al_pomodoro.png',
    description:
      'Reinheit des Oona Kaviars mit max. 3.5% Salz. Leicht gesalzen, nussig.',
    variants: [
      { id: '30g', name: 'Dose 30g' },
      { id: '50g', name: 'Dose 50g' },
      { id: '125g', name: 'Dose 125g' },
    ],
  },
  {
    id: 'oona-millesime-20',
    title: 'Oona Caviar Millésime',
    categoryId: 'single',
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop',
    description:
      'Intensiver Geschmack, glänzend schwarz. Gereift und im Glas pasteurisiert.',
    variants: [
      { id: '20g', name: 'Glas 20g' },
      { id: '50g', name: 'Glas 50g' },
    ],
    promo: true,
  },
  {
    id: 'oona-osietra-50',
    title: 'Oona Caviar Osietra Carat',
    categoryId: 'single',
    price: 179.0,
    image: 'https://images.unsplash.com/photo-1481671703460-040cb8a2d909?q=80&w=1200&auto=format&fit=crop',
    description:
      'Titanfarbenes Korn, olivener Schimmer. Nussig, frisch mit erdigen Noten.',
    variants: [
      { id: '50g', name: 'Dose 50g' },
      { id: '100g', name: 'Dose 100g' },
    ],
  },
  {
    id: 'oona-butter',
    title: 'Oona Kaviarbutter',
    categoryId: 'single',
    price: 34.0,
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1200&auto=format&fit=crop',
    description: 'Traditionelle Bergbutter verfeinert mit Oona Caviar Millésime.',
    variants: [{ id: '40g', name: '40 g' }],
  },
  {
    id: 'gift-103-heidsieck',
    title: 'Sugo al pomodoro Tomatensauce mit Basilikum, 370 g',
    categoryId: 'combination',
    price: 239.0,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop',
    description: '1.Lieferantendaten: Restaurant Pizzeria Pinocchio, Elawilerstrasse 32, 9242 Qberuzwil 2.Produktname und Beschreibung: Sugo al pomodoro 3.Menge und Gewicht: 370g 4.Haltbarkeitsdatum: 1 Jahr 5.Lagerbedingungen: Kühlschrank aufbewahren 6.Verwendung im Restaurant: Spaghetti al Pomodoro e Basilico 7.Entsorgung oder Rückruf (falls zutreffend): /',
    variants: [{ id: 'set', name: 'Set' }],
  },
  {
    id: 'egli-fresh',
    title: 'Eglifilet frisch, mit Haut',
    categoryId: 'single',
    price: 19.0,
    image: 'https://images.unsplash.com/photo-1528838068457-53f3f2ee1a87?q=80&w=1200&auto=format&fit=crop',
    description: 'Frische Egli aus warmem Bergwasser, ideal für feine Gerichte.',
    variants: [{ id: '250g', name: '250 g' }],
  },
]

export function getProductById(id) {
  return products.find((p) => p.id === id)
}


