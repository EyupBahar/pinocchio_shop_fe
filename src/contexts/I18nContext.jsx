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
    
    // My Orders
    myOrders: 'Meine Bestellungen',
    myOrdersLink: 'Meine Bestellungen',
    pleaseLoginToViewOrders: 'Bitte melden Sie sich an, um Ihre Bestellungen anzuzeigen.',
    loadingOrders: 'Laden...',
    errorOccurred: 'Fehler aufgetreten',
    whatShouldIDo: 'Was soll ich tun?',
    backendServerError: 'Dies ist ein Backend-Serverfehler (500 Internal Server Error)',
    apiCallSuccessfulButBackendError: 'Der API-Aufruf war erfolgreich, aber der Backend hat einen Fehler zurückgegeben',
    pleaseReportToBackendTeam: 'Bitte melden Sie diesen Fehler dem Backend-Team',
    refreshAndTryAgain: 'Sie können die Seite aktualisieren und es erneut versuchen',
    refreshPage: 'Seite aktualisieren',
    backToShopping: 'Zurück zum Einkaufen',
    noOrdersYet: 'Sie haben noch keine Bestellungen',
    startShopping: 'Einkaufen beginnen',
    orderFound: 'Bestellung gefunden',
    ordersFound: 'Bestellungen gefunden',
    orderNumber: 'Bestellung',
    orderTime: 'Bestellzeit',
    dateInfoNotAvailable: 'Keine Datumsinformation verfügbar',
    statusPending: 'Ausstehend',
    statusPreparing: 'Wird vorbereitet',
    statusShipping: 'Versandt',
    statusDelivered: 'Geliefert',
    statusCancelled: 'Storniert',
    statusUnknown: 'Status',
    paid: 'Bezahlt',
    totalAmount: 'Gesamtbetrag',
    deliveryAddress: 'Lieferadresse',
    productCount: 'Anzahl der Produkte',
    product: 'Produkt',
    products: 'Produkte',
    userIdNotFound: 'Benutzer-ID nicht gefunden. Bitte melden Sie sich erneut an.',
    sessionNotFound: 'Sitzung nicht gefunden. Bitte melden Sie sich an.',
    userInfoNotAvailable: 'Benutzerinformationen konnten nicht abgerufen werden. Bitte melden Sie sich erneut an.',
    errorLoadingOrders: 'Beim Laden der Bestellungen ist ein Fehler aufgetreten.',
    apiEndpointNotFound: 'API-Endpunkt nicht gefunden (404). Bitte kontaktieren Sie den Administrator.',
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
    
    // My Orders
    myOrders: 'My Orders',
    myOrdersLink: 'My Orders',
    pleaseLoginToViewOrders: 'Please log in to view your orders.',
    loadingOrders: 'Loading...',
    errorOccurred: 'Error Occurred',
    whatShouldIDo: 'What should I do?',
    backendServerError: 'This is a backend server error (500 Internal Server Error)',
    apiCallSuccessfulButBackendError: 'The API call was successful but the backend returned an error',
    pleaseReportToBackendTeam: 'Please report this error to the backend team',
    refreshAndTryAgain: 'You can refresh the page and try again',
    refreshPage: 'Refresh Page',
    backToShopping: 'Back to Shopping',
    noOrdersYet: 'You have no orders yet',
    startShopping: 'Start Shopping',
    orderFound: 'order found',
    ordersFound: 'orders found',
    orderNumber: 'Order',
    orderTime: 'Order Time',
    dateInfoNotAvailable: 'Date information not available',
    statusPending: 'Pending',
    statusPreparing: 'Preparing',
    statusShipping: 'Shipping',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',
    statusUnknown: 'Status',
    paid: 'Paid',
    totalAmount: 'Total Amount',
    deliveryAddress: 'Delivery Address',
    productCount: 'Product Count',
    product: 'product',
    products: 'products',
    userIdNotFound: 'User ID not found. Please log in again.',
    sessionNotFound: 'Session not found. Please log in.',
    userInfoNotAvailable: 'User information could not be retrieved. Please log in again.',
    errorLoadingOrders: 'An error occurred while loading orders.',
    apiEndpointNotFound: 'API endpoint not found (404). Please contact the administrator.',
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
    
    // My Orders
    myOrders: 'Mes Commandes',
    myOrdersLink: 'Mes Commandes',
    pleaseLoginToViewOrders: 'Veuillez vous connecter pour voir vos commandes.',
    loadingOrders: 'Chargement...',
    errorOccurred: 'Erreur survenue',
    whatShouldIDo: 'Que dois-je faire?',
    backendServerError: 'Ceci est une erreur du serveur backend (500 Internal Server Error)',
    apiCallSuccessfulButBackendError: "L'appel API a réussi mais le backend a renvoyé une erreur",
    pleaseReportToBackendTeam: 'Veuillez signaler cette erreur à l\'équipe backend',
    refreshAndTryAgain: 'Vous pouvez actualiser la page et réessayer',
    refreshPage: 'Actualiser la page',
    backToShopping: 'Retour aux achats',
    noOrdersYet: 'Vous n\'avez pas encore de commandes',
    startShopping: 'Commencer les achats',
    orderFound: 'commande trouvée',
    ordersFound: 'commandes trouvées',
    orderNumber: 'Commande',
    orderTime: 'Heure de commande',
    dateInfoNotAvailable: 'Informations de date non disponibles',
    statusPending: 'En attente',
    statusPreparing: 'En préparation',
    statusShipping: 'Expédié',
    statusDelivered: 'Livré',
    statusCancelled: 'Annulé',
    statusUnknown: 'Statut',
    paid: 'Payé',
    totalAmount: 'Montant total',
    deliveryAddress: 'Adresse de livraison',
    productCount: 'Nombre de produits',
    product: 'produit',
    products: 'produits',
    userIdNotFound: 'ID utilisateur introuvable. Veuillez vous reconnecter.',
    sessionNotFound: 'Session introuvable. Veuillez vous connecter.',
    userInfoNotAvailable: 'Les informations utilisateur n\'ont pas pu être récupérées. Veuillez vous reconnecter.',
    errorLoadingOrders: 'Une erreur s\'est produite lors du chargement des commandes.',
    apiEndpointNotFound: 'Point de terminaison API introuvable (404). Veuillez contacter l\'administrateur.',
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
    
    // My Orders
    myOrders: 'I Miei Ordini',
    myOrdersLink: 'I Miei Ordini',
    pleaseLoginToViewOrders: 'Effettua l\'accesso per visualizzare i tuoi ordini.',
    loadingOrders: 'Caricamento...',
    errorOccurred: 'Errore verificato',
    whatShouldIDo: 'Cosa devo fare?',
    backendServerError: 'Questo è un errore del server backend (500 Internal Server Error)',
    apiCallSuccessfulButBackendError: 'La chiamata API è riuscita ma il backend ha restituito un errore',
    pleaseReportToBackendTeam: 'Si prega di segnalare questo errore al team backend',
    refreshAndTryAgain: 'Puoi aggiornare la pagina e riprovare',
    refreshPage: 'Aggiorna pagina',
    backToShopping: 'Torna allo shopping',
    noOrdersYet: 'Non hai ancora ordini',
    startShopping: 'Inizia lo shopping',
    orderFound: 'ordine trovato',
    ordersFound: 'ordini trovati',
    orderNumber: 'Ordine',
    orderTime: 'Ora dell\'ordine',
    dateInfoNotAvailable: 'Informazioni sulla data non disponibili',
    statusPending: 'In attesa',
    statusPreparing: 'In preparazione',
    statusShipping: 'In spedizione',
    statusDelivered: 'Consegnato',
    statusCancelled: 'Annullato',
    statusUnknown: 'Stato',
    paid: 'Pagato',
    totalAmount: 'Importo totale',
    deliveryAddress: 'Indirizzo di consegna',
    productCount: 'Numero di prodotti',
    product: 'prodotto',
    products: 'prodotti',
    userIdNotFound: 'ID utente non trovato. Si prega di accedere di nuovo.',
    sessionNotFound: 'Sessione non trovata. Si prega di accedere.',
    userInfoNotAvailable: 'Le informazioni utente non sono state recuperate. Si prega di accedere di nuovo.',
    errorLoadingOrders: 'Si è verificato un errore durante il caricamento degli ordini.',
    apiEndpointNotFound: 'Endpoint API non trovato (404). Si prega di contattare l\'amministratore.',
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



