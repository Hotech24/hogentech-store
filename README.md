# 🏪 HogenTech Store

**Plateforme de commerce hybride moderne** — Backend Django 5 + Frontend React 19

---

## 📁 Structure du projet

```
hogentech-store/
├── backend/              # Django 5 + DRF
│   ├── hogentech/        # Configuration Django
│   ├── apps/
│   │   ├── accounts/     # Authentification & roles
│   │   ├── products/     # Catalogue produits
│   │   ├── orders/       # Commandes & ventes
│   │   └── invoices/     # Factures PDF (WeasyPrint)
│   ├── templates/
│   │   └── invoices/
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/             # React 19 + Tailwind
    ├── src/
    │   ├── api/          # Axios config
    │   ├── components/   # UI, Layout, POS, Dashboard
    │   ├── context/      # Auth & Cart contexts
    │   ├── hooks/        # useAuth
    │   ├── pages/        # Client & Dashboard pages
    │   └── App.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Installation & Test en Local

### Prérequis
- Python 3.11+
- Node.js 20+
- pip & npm

### Étape 1 : Backend Django

```bash
# 1. Se placer dans le dossier backend
cd hogentech-store/backend

# 2. Créer l'environnement virtuel
python -m venv venv

# 3. Activer l'environnement
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Appliquer les migrations
python manage.py migrate

# 6. Créer un super-utilisateur (admin)
python manage.py createsuperuser
# Username: admin
# Email: admin@hogentech.store
# Password: admin123

# 7. Lancer le serveur
python manage.py runserver
```
Le backend sera accessible sur **http://localhost:8000**

### Étape 2 : Frontend React

```bash
# 1. Ouvrir un NOUVEAU terminal (garder Django actif)
# 2. Se placer dans le dossier frontend
cd hogentech-store/frontend

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev
```
Le frontend sera accessible sur **http://localhost:5173**

---

## 🔑 Comptes de démonstration

| Rôle | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Vendeur | `vendor` | `vendor123` |
| Client | `client` | `client123` |

> **Note :** Créez ces utilisateurs via l'admin Django (`/admin`) ou l'API.

---

## 🛠️ Fonctionnalités

### Expérience Vendeur (Dashboard)
- ✅ Sidebar rétractable avec icônes minimalistes
- ✅ Interface POS Glassmorphism (fond transparent + flou)
- ✅ Barre de recherche globale **Cmd+K / Ctrl+K**
- ✅ Modal de prévisualisation du reçu avant impression
- ✅ Génération de factures PDF modernes (WeasyPrint)

### Interface Client (E-commerce)
- ✅ Design inspiré Apple/Stripe (espace blanc, typographie Inter)
- ✅ Grille produits avec ombres douces et hover accentué
- ✅ Animations Framer Motion (ajout au panier, transitions)
- ✅ Panier latéral avec animations

### Backend Django
- ✅ Django-Cleanup (suppression auto des images)
- ✅ Factures PDF avec mise en page CSS moderne
- ✅ Gestion des rôles : Admin (total) / Vendeur (POS + stocks)
- ✅ JWT Authentication (SimpleJWT)
- ✅ API REST complète (DRF)

### Dashboard Statistique
- ✅ Graphiques Area Charts (surfaces dégradées)
- ✅ Badges colorés pour l'état des stocks
- ✅ Statistiques journalières sur 30 jours

---

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login/` | JWT Login |
| `POST /api/auth/refresh/` | Refresh Token |
| `GET /api/products/` | Liste produits |
| `GET /api/products/search/global/?q=` | Recherche globale |
| `POST /api/orders/` | Créer commande |
| `GET /api/orders/stats/dashboard/` | Stats dashboard |
| `GET /api/invoices/preview/<id>/` | Aperçu facture HTML |
| `POST /api/invoices/generate/<id>/` | Générer PDF |

---

## 🎨 Design System

- **Palette :** Slate, Indigo, Emerald
- **Typographie :** Inter (Google Fonts)
- **Border-radius :** `1rem` (16px)
- **Effets :** Glassmorphism, backdrop-blur, ombres douces
- **Animations :** Framer Motion (spring, fade, slide)

---

## 🚀 Déploiement Production

### Backend (PythonAnywhere / DigitalOcean / AWS)
```bash
# 1. Changer SECRET_KEY dans settings.py
# 2. DEBUG = False
# 3. Configurer ALLOWED_HOSTS
# 4. Collecter les fichiers statiques
python manage.py collectstatic
# 5. Utiliser Gunicorn + Nginx
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Déployer le dossier `dist/`
```

---

## 📝 Notes importantes

- **WeasyPrint** nécessite des dépendances système (cairo, pango). Sur Ubuntu : `sudo apt-get install -y libcairo2 libpango-1.0-0`
- **Media files** : En production, utiliser un service de stockage (AWS S3, Cloudinary)
- **CORS** : Configurer `CORS_ALLOWED_ORIGINS` en production
- **Base de données** : Passer à PostgreSQL en production

---

## 📧 Support

**HogenTech Store** — Développé avec ❤️ par HogenTech
