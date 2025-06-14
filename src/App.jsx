// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importation des pages existantes basées sur le code fourni
import Inscription from './pages/Inscription';
import InscriptionUser from './pages/InscriptionUser';
import InscriptionProfessionnel from './pages/InscriptionProfessionnel';
import Connexion from './pages/Connexion';
import Ressources from './pages/Ressources';
import Forum from './pages/Forum';
import TableauUtilisateur from './pages/TableauUtilisateur';
import TableauAdmin from './pages/TableauAdmin';
import TableauProfessionnel from './pages/TableauProfessionnel';
import Accueil from './pages/Accueil';
import AdminDashboard from './components/admin/AdminDashboard';
import DevenirPremium from './pages/DevenirPremium'; 

// Importation du Contexte pour les ressources
import { RessourceProvider } from './pages/RessourceContext.jsx'; 

// NOUVELLES IMPORTATIONS pour la Phase 2 : Recherche et Réservation de Professionnels
import ListeProfessionnels from './pages/Professionnels/ListeProfessionnels';
import DetailProfessionnel from './pages/Professionnels/DetailProfessionnel';


function App() {
    return (
        <Router>
            {/* Le RessourceProvider doit envelopper toutes les routes qui en ont besoin */}
            <RessourceProvider>
                <Routes>
                    {/* Routes existantes de votre code */}
                    <Route path="/" element={<Accueil />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/inscription/utilisateur" element={<InscriptionUser />} />
                    <Route path="/inscription/professionnel" element={<InscriptionProfessionnel />} />
                    <Route path="/connexion" element={<Connexion />} />
                    <Route path="/ressources" element={<Ressources />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/devenir-premium" element={<DevenirPremium />} /> 

                    {/* Routes des tableaux de bord (telles que vous les avez fournies) */}
                    <Route path="/tableauAdmin" element={<TableauAdmin />} /> 
                    <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Route alternative ou sous-section admin */}
                    <Route path="/tableauUtilisateur" element={<TableauUtilisateur />} />
                    <Route path="/tableauProfessionnel" element={<TableauProfessionnel />} />

                    {/* NOUVELLES ROUTES pour la Phase 2 : Recherche et Réservation de Professionnels */}
                    <Route path="/professionnels" element={<ListeProfessionnels />} /> {/* Affiche la liste des professionnels */}
                    <Route path="/professionnels/:id" element={<DetailProfessionnel />} /> {/* Affiche le profil détaillé d'un professionnel */}

                    {/* IMPORTANT : Si vous souhaitez ajouter des routes pour les pages légales, 404, messagerie, ou les gestions admin,
                       vous devrez les importer et les ajouter ici manuellement selon vos besoins.
                       Pour le moment, elles ne sont pas incluses car non présentes dans votre dernière fourniture de code.
                    */}
                </Routes>
            </RessourceProvider>
        </Router>
    );
}

export default App;
