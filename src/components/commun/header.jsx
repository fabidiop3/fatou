// src/components/commun/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/serviceAuth'; // Assurez-vous que serviceAuth.js gère la déconnexion
import { useRessource } from '../../pages/RessourceContext.jsx'; // Assurez-vous que ce chemin est correct

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const { selectedCategory, setSelectedCategory, categoriesOrder } = useRessource();

    const [currentRole, setCurrentRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedRole = localStorage.getItem('role');
            setCurrentRole(updatedRole);

            if (!updatedRole) {
                console.log("Rôle non trouvé dans localStorage, redirection vers /connexion.");
                navigate('/connexion');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        setCurrentRole(localStorage.getItem('role'));

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate]);

    // Fonction de déconnexion utilisant le serviceAuth
    const handleDeconnexion = async () => {
        console.log("handleDeconnexion: Tentative de déconnexion...");
        try {
            await logout(); // Appel à la fonction logout du service d'authentification
            console.log("handleDeconnexion: Appel à logout terminé.");
            // Le `useEffect` ci-dessus gérera la redirection si le rôle disparaît du localStorage
        } catch (error) {
            console.error("handleDeconnexion: Erreur lors de la déconnexion:", error);
        }
    };

    const isProfessional = (userRole) => {
        return userRole === 'PSYCHIATRE' || userRole === 'PSYCHOLOGUE';
    };

    const isPremiumUser = (userRole) => {
        return userRole === 'PREMIUM' || userRole === 'ADMIN'; 
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory); 
        
        if (location.pathname !== '/ressources') {
            navigate('/ressources');
        }
    };

    const isAuthenticated = !!currentRole; 

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tight mb-2 md:mb-0">
                    PsyConnect
                </Link>

                {/* Navigation principale */}
                <nav className="flex flex-wrap justify-center md:flex-nowrap items-center space-x-4 md:space-x-6 text-gray-700 text-sm font-medium">
                    {/* Liens toujours visibles si non Admin */}
                    {currentRole !== 'ADMIN' && (
                        <Link to="/" className="hover:text-indigo-600 transition">Accueil</Link>
                    )}
                    
                    {/* Liens spécifiques pour l'utilisateur (non-pro, non-admin) */}
                    {currentRole === 'UTILISATEUR' && (
                        <>
                            {/* Menu déroulant des Ressources */}
                            <div className="relative">
                                <label htmlFor="resource-category-select" className="sr-only">Filtrer les ressources</label>
                                <select
                                    id="resource-category-select"
                                    className="bg-white text-gray-700 py-1 px-3 rounded-md border border-gray-300 hover:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    {categoriesOrder.map(cat => (
                                        <option key={cat.key} value={cat.key}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Link to="/professionnels" className="hover:text-indigo-600 transition">Professionnels</Link>
                        </>
                    )}

                    {/* Lien Forum (visible pour Utilisateur et Professionnel) */}
                    {(currentRole === 'UTILISATEUR' || isProfessional(currentRole)) && (
                        <Link to="/forum" className="hover:text-indigo-600 transition">Forum</Link>
                    )}

                    {/* Liens conditionnels basés sur le rôle */}
                    {isAuthenticated ? ( 
                        <>
                            {currentRole === 'UTILISATEUR' && (
                                <>
                                    <Link to="/messagerie" className="hover:text-indigo-600 transition">Messagerie</Link>
                                    <Link to="/tableauUtilisateur" className="hover:text-indigo-600 transition">Espace Utilisateur</Link>
                                    {/* Lien "Devenir Premium" - visible si utilisateur et non premium */}
                                    {!isPremiumUser(currentRole) && (
                                        <Link 
                                            to="/devenir-premium" 
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition ml-2"
                                        >
                                            Devenir Premium ✨
                                        </Link>
                                    )}
                                </>
                            )}
                            
                            {isProfessional(currentRole) && (
                                <>
                                    <Link to="/messagerie" className="hover:text-indigo-600 transition">Messagerie</Link> 
                                    <Link to="/tableauProfessionnel" className="hover:text-indigo-600 transition">Espace Pro</Link>
                                </>
                            )}

                            {currentRole === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="hover:text-indigo-600 transition">Admin</Link>
                            )}

                            {/* Bouton de Déconnexion stylisé */}
                            <button
                                onClick={handleDeconnexion}
                                // Nouvelle classe pour un style similaire au bouton d'inscription, mais en rouge
                                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition ml-2"
                            >
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/connexion" className="hover:text-indigo-600 transition">Connexion</Link>
                            <Link to="/inscription" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition ml-2"> Inscription </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
