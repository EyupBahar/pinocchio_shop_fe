import { createContext, useContext, useMemo, useState } from 'react'

const I18nContext = createContext(null)

const translations = {
  de: {
    // Navigation & General
    shop: 'Shop',
    cart: 'Warenkorb',
    checkout: 'Zur Kasse',
    login: 'Anmelden',
    logout: 'Abmelden',
    home: 'Startseite',
    
    // Cart & Shopping
    emptyCart: 'Ihr Warenkorb ist leer.',
    subtotal: 'Zwischensumme',
    addToCart: 'In den Warenkorb',
    removeFromCart: 'Entfernen',
    nowShop: 'Jetzt einkaufen',
    
    // Product
    categories: 'Shop-Kategorien',
    priceFrom: 'ab CHF',
    size: 'Größe',
    quantity: 'Anzahl',
    
    // Categories
    allProducts: 'Alle Produkte',
    singleProduct: 'Einzelstücke',
    combination: 'Geschenksets',
    
    // Sorting
    sorting: 'Sortierung:',
    featured: 'Empfohlen',
    priceAsc: 'Preis: aufsteigend',
    priceDesc: 'Preis: absteigend',
    
    // Pagination
    page: 'Seite',
    
    // Footer
    terms: 'AGB',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    
    // Hero
    heroTitle: 'Echter Schweizer Alpen Kaviar',
    heroSubtitle: 'Entdecke edle Kaviar-Spezialitäten und Gourmetprodukte. Frisch, charaktervoll, für besondere Momente.',
    products: 'Produkte',
    viewAll: 'Alle ansehen',
    
    // Misc
    loading: 'Laden...',
    notFound: 'Produkt nicht gefunden.',
    action: 'Aktion',
    welcome: 'Willkommen',
    register: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    
    // Product Management
    addProduct: 'Produkt hinzufügen',
    editProduct: 'Produkt bearbeiten',
    createProduct: 'Produkt erstellen',
    updateProduct: 'Produkt aktualisieren',
    deleteProduct: 'Produkt löschen',
    cancel: 'Abbrechen',
    add: 'Hinzufügen',
    saving: 'Speichern...',
    deleting: 'Löschen...',
    loadingProduct: 'Produkt wird geladen...',
    
    // Forms
    title: 'Titel',
    description: 'Beschreibung',
    productFeatures: 'Produkteigenschaften',
    shipmentFeatures: 'Versandeigenschaften',
    deliveryFeatures: 'Lieferungseigenschaften',
    price: 'Preis',
    discountedPrice: 'Reduzierter Preis',
    mainImageUrl: 'Hauptbild-URL',
    additionalImages: 'Zusätzliche Bilder',
    category: 'Kategorie',
    rating: 'Bewertung',
    deliveryTime: 'Lieferzeit',
    productIsActive: 'Produkt ist aktiv',
    selectCategory: 'Kategorie auswählen',
    
    // Login/Register
    myAccount: 'Mein Konto',
    createAccount: 'Konto erstellen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    phone: 'Telefon',
    or: 'oder',
    signInWithGoogle: 'Mit Google anmelden',
    submitting: 'Wird übermittelt...',
    registrationSuccessful: 'Registrierung erfolgreich. Sie können sich jetzt anmelden.',
    registrationFailed: 'Registrierung fehlgeschlagen',
    loginFailed: 'Anmeldung fehlgeschlagen! Bitte überprüfen Sie Ihre Daten.',
    demoCredentials: 'Demo Zugangsdaten:',
    username: 'Benutzername',
    demoPassword: 'Passwort',
    dontHaveAccount: 'Haben Sie noch kein Konto?',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
    
    // Product Update
    noChangesDetected: 'Keine Änderungen erkannt',
    initialDataNotLoaded: 'Ursprüngliche Produktdaten nicht geladen. Bitte Seite aktualisieren.',
  },
  en: {
    // Navigation & General
    shop: 'Shop',
    cart: 'Cart',
    checkout: 'Checkout',
    login: 'Login',
    logout: 'Logout',
    home: 'Home',
    
    // Cart & Shopping
    emptyCart: 'Your cart is empty.',
    subtotal: 'Subtotal',
    addToCart: 'Add to cart',
    removeFromCart: 'Remove',
    nowShop: 'Shop now',
    
    // Product
    categories: 'Shop Categories',
    priceFrom: 'from CHF',
    size: 'Size',
    quantity: 'Quantity',
    
    // Categories
    allProducts: 'All Products',
    singleProduct: 'Individual Pieces',
    combination: 'Gift Sets',
    
    // Sorting
    sorting: 'Sort by:',
    featured: 'Featured',
    priceAsc: 'Price: Low to High',
    priceDesc: 'Price: High to Low',
    
    // Pagination
    page: 'Page',
    
    // Footer
    terms: 'Terms',
    privacy: 'Privacy',
    imprint: 'Imprint',
    
    // Hero
    heroTitle: 'Authentic Swiss Alpine Caviar',
    heroSubtitle: 'Discover exquisite caviar specialties and gourmet products. Fresh, distinctive, for special moments.',
    products: 'Products',
    viewAll: 'View all',
    
    // Misc
    loading: 'Loading...',
    notFound: 'Product not found.',
    action: 'Sale',
    welcome: 'Welcome',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    
    // Product Management
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    createProduct: 'Create Product',
    updateProduct: 'Update Product',
    deleteProduct: 'Delete Product',
    cancel: 'Cancel',
    add: 'Add',
    saving: 'Saving...',
    deleting: 'Deleting...',
    loadingProduct: 'Loading product...',
    
    // Forms
    title: 'Title',
    description: 'Description',
    productFeatures: 'Product Features',
    shipmentFeatures: 'Shipment Features',
    deliveryFeatures: 'Delivery Features',
    price: 'Price',
    discountedPrice: 'Discounted Price',
    mainImageUrl: 'Main Image URL',
    additionalImages: 'Additional Images',
    category: 'Category',
    rating: 'Rating',
    deliveryTime: 'Delivery Time',
    productIsActive: 'Product is active',
    selectCategory: 'Select category',
    
    // Login/Register
    myAccount: 'My Account',
    createAccount: 'Create account',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    or: 'or',
    signInWithGoogle: 'Sign in with Google',
    submitting: 'Submitting…',
    registrationSuccessful: 'Registration successful. You can now sign in.',
    registrationFailed: 'Registration failed',
    loginFailed: 'Login failed! Please check your credentials.',
    demoCredentials: 'Demo Credentials:',
    username: 'Username',
    demoPassword: 'Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    
    // Product Update
    noChangesDetected: 'No changes detected',
    initialDataNotLoaded: 'Initial product data not loaded. Please refresh the page.',
  },
  fr: {
    // Navigation & General
    shop: 'Boutique',
    cart: 'Panier',
    checkout: 'Commander',
    login: 'Connexion',
    logout: 'Déconnexion',
    home: 'Accueil',
    
    // Cart & Shopping
    emptyCart: 'Votre panier est vide.',
    subtotal: 'Sous-total',
    addToCart: 'Ajouter au panier',
    removeFromCart: 'Supprimer',
    nowShop: 'Acheter',
    
    // Product
    categories: 'Catégories',
    priceFrom: 'dès CHF',
    size: 'Taille',
    quantity: 'Quantité',
    
    // Categories
    allProducts: 'Tous les produits',
    singleProduct: 'Pièces individuelles',
    combination: 'Coffrets cadeaux',
    
    // Sorting
    sorting: 'Trier par:',
    featured: 'Recommandés',
    priceAsc: 'Prix: croissant',
    priceDesc: 'Prix: décroissant',
    
    // Pagination
    page: 'Page',
    
    // Footer
    terms: 'CGV',
    privacy: 'Confidentialité',
    imprint: 'Mentions légales',
    
    // Hero
    heroTitle: 'Authentique Caviar des Alpes Suisses',
    heroSubtitle: 'Découvrez des spécialités de caviar exquises et des produits gourmets. Frais, caractéristique, pour des moments spéciaux.',
    products: 'Produits',
    viewAll: 'Voir tout',
    
    // Misc
    loading: 'Chargement...',
    notFound: 'Produit introuvable.',
    action: 'Promotion',
    welcome: 'Bienvenue',
    register: "S'inscrire",
    email: 'E-mail',
    password: 'Mot de passe',
    
    // Product Management
    addProduct: 'Ajouter un produit',
    editProduct: 'Modifier le produit',
    createProduct: 'Créer un produit',
    updateProduct: 'Mettre à jour le produit',
    deleteProduct: 'Supprimer le produit',
    cancel: 'Annuler',
    add: 'Ajouter',
    saving: 'Enregistrement...',
    deleting: 'Suppression...',
    loadingProduct: 'Chargement du produit...',
    
    // Forms
    title: 'Titre',
    description: 'Description',
    productFeatures: 'Caractéristiques du produit',
    shipmentFeatures: "Caractéristiques d'expédition",
    deliveryFeatures: 'Caractéristiques de livraison',
    price: 'Prix',
    discountedPrice: 'Prix réduit',
    mainImageUrl: "URL de l'image principale",
    additionalImages: 'Images supplémentaires',
    category: 'Catégorie',
    rating: 'Note',
    deliveryTime: 'Délai de livraison',
    productIsActive: 'Le produit est actif',
    selectCategory: 'Sélectionner une catégorie',
    
    // Login/Register
    myAccount: 'Mon compte',
    createAccount: 'Créer un compte',
    firstName: 'Prénom',
    lastName: 'Nom',
    phone: 'Téléphone',
    or: 'ou',
    signInWithGoogle: 'Se connecter avec Google',
    submitting: 'Envoi en cours...',
    registrationSuccessful: 'Inscription réussie. Vous pouvez maintenant vous connecter.',
    registrationFailed: "Échec de l'inscription",
    loginFailed: 'Échec de la connexion! Veuillez vérifier vos identifiants.',
    demoCredentials: 'Identifiants de démonstration:',
    username: "Nom d'utilisateur",
    demoPassword: 'Mot de passe',
    dontHaveAccount: "Vous n'avez pas de compte?",
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    
    // Product Update
    noChangesDetected: 'Aucun changement détecté',
    initialDataNotLoaded: 'Données initiales du produit non chargées. Veuillez actualiser la page.',
  },
  it: {
    // Navigation & General
    shop: 'Shop',
    cart: 'Carrello',
    checkout: 'Cassa',
    login: 'Accedi',
    logout: 'Esci',
    home: 'Home',
    
    // Cart & Shopping
    emptyCart: 'Il tuo carrello è vuoto.',
    subtotal: 'Subtotale',
    addToCart: 'Aggiungi al carrello',
    removeFromCart: 'Rimuovi',
    nowShop: 'Acquista ora',
    
    // Product
    categories: 'Categorie Shop',
    priceFrom: 'da CHF',
    size: 'Dimensione',
    quantity: 'Quantità',
    
    // Categories
    allProducts: 'Tutti i prodotti',
    singleProduct: 'Pezzi singoli',
    combination: 'Set regalo',
    
    // Sorting
    sorting: 'Ordina per:',
    featured: 'In evidenza',
    priceAsc: 'Prezzo: dal basso all’alto',
    priceDesc: 'Prezzo: dall’alto al basso',
    
    // Pagination
    page: 'Pagina',
    
    // Footer
    terms: 'Termini',
    privacy: 'Privacy',
    imprint: 'Note legali',
    
    // Hero
    heroTitle: 'Autentico caviale delle Alpi svizzere',
    heroSubtitle: 'Scopri specialità di caviale e prodotti gourmet. Freschi, caratteristici, per momenti speciali.',
    products: 'Prodotti',
    viewAll: 'Vedi tutto',
    
    // Misc
    loading: 'Caricamento...',
    notFound: 'Prodotto non trovato.',
    action: 'Offerta',
    welcome: 'Benvenuto',
    register: 'Registrati',
    email: 'Email',
    password: 'Password',
    
    // Product Management
    addProduct: 'Aggiungi prodotto',
    editProduct: 'Modifica prodotto',
    createProduct: 'Crea prodotto',
    updateProduct: 'Aggiorna prodotto',
    deleteProduct: 'Elimina prodotto',
    cancel: 'Annulla',
    add: 'Aggiungi',
    saving: 'Salvataggio...',
    deleting: 'Eliminazione...',
    loadingProduct: 'Caricamento prodotto...',
    
    // Forms
    title: 'Titolo',
    description: 'Descrizione',
    productFeatures: 'Caratteristiche del prodotto',
    shipmentFeatures: 'Caratteristiche di spedizione',
    deliveryFeatures: 'Caratteristiche di consegna',
    price: 'Prezzo',
    discountedPrice: 'Prezzo scontato',
    mainImageUrl: 'URL immagine principale',
    additionalImages: 'Immagini aggiuntive',
    category: 'Categoria',
    rating: 'Valutazione',
    deliveryTime: 'Tempo di consegna',
    productIsActive: 'Il prodotto è attivo',
    selectCategory: 'Seleziona categoria',
    
    // Login/Register
    myAccount: 'Il mio account',
    createAccount: 'Crea account',
    firstName: 'Nome',
    lastName: 'Cognome',
    phone: 'Telefono',
    or: 'o',
    signInWithGoogle: 'Accedi con Google',
    submitting: 'Invio in corso...',
    registrationSuccessful: 'Registrazione completata. Ora puoi accedere.',
    registrationFailed: 'Registrazione fallita',
    loginFailed: 'Accesso fallito! Controlla le tue credenziali.',
    demoCredentials: 'Credenziali demo:',
    username: 'Nome utente',
    demoPassword: 'Password',
    dontHaveAccount: 'Non hai un account?',
    alreadyHaveAccount: 'Hai già un account?',
    
    // Product Update
    noChangesDetected: 'Nessuna modifica rilevata',
    initialDataNotLoaded: 'Dati iniziali del prodotto non caricati. Si prega di aggiornare la pagina.',
  },
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('de')
  const dict = translations[lang]

  const t = useMemo(() => (key) => dict[key] ?? key, [dict])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}



