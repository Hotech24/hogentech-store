#!/bin/bash
# HogenTech Store - Script d'installation rapide

echo "🚀 Installation de HogenTech Store..."

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser --noinput --username admin --email admin@hogentech.store || true
echo "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.filter(username='admin').first(); u and u.set_password('admin123') and u.save()" | python manage.py shell
echo "✅ Backend prêt !"
echo "Lancez : python manage.py runserver"

cd ../frontend
npm install
echo "✅ Frontend prêt !"
echo "Lancez : npm run dev"
