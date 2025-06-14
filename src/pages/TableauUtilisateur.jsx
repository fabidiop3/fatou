// src/pages/TableauUtilisateur.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/commun/Layout'; 
import SuiviHumeur from '../components/utilisateur/SuiviHumeur'; 
import FormulaireProfil from '../components/utilisateur/FormulaireProfil'; 
import MesReservations from '../components/utilisateur/MesReservations';
import { 
    getProfil, 
    getConsultationsUtilisateur, 
} from '../services/serviceUtilisateur'; 
import { getCurrentUserInfo } from '../services/serviceAuth'; 

const TableauUtilisateur = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [consultationsPassees, setConsultationsPassees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null); 
    const [consultationsError, setConsultationsError] = useState(null); 
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('reservations'); 

    // États pour le modal de confirmation personnalisé
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalTitle, setConfirmModalTitle] = useState(''); 
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(null); 

    // Nouveaux états pour le modal d'information personnalisé
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalTitle, setInfoModalTitle] = useState('');
    const [infoModalContent, setInfoModalContent, ] = useState(''); // Corrected line, ensure no comma here

    // Effet pour masquer les messages de succès/erreur après un délai
    useEffect(() => {
        if (successMessage || globalError) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setGlobalError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, globalError]);

    // Fonction pour afficher le modal de confirmation (sera passée à MesReservations)
    const handleShowConfirmModal = useCallback((title, message, action) => { 
        setConfirmModalTitle(title); 
        setConfirmModalMessage(message);
        setConfirmModalAction(() => action); 
        setShowConfirmModal(true);
    }, []);

    // Fonction pour afficher le modal d'information (sera passée à MesReservations)
    const handleShowInfoModal = useCallback((title, content) => {
        setInfoModalTitle(title);
        setInfoModalContent(content);
        setShowInfoModal(true);
    }, []);

    // Fetch current user info (including ID, email, role, nom, prenom, telephone)
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setGlobalError(null);
            try {
                let user = getCurrentUserInfo(); 
                
                // Si l'ID est manquant ou non numérique dans localStorage, tente de le récupérer via /auth/me
                if (!user || (typeof user.id !== 'number' && (typeof user.id !== 'string' || isNaN(parseInt(user.id, 10))))) {
                    console.log("TableauUtilisateur: User info not complete or ID invalid in localStorage, fetching from API /auth/me...");
                    user = await getProfil(); 
                    console.log("TableauUtilisateur: User info from /auth/me API (after fetch):", user);
                } else {
                    console.log("TableauUtilisateur: User info from localStorage (initial check, ID looks good):", user);
                }
                
                // Final check and type conversion for user.id
                if (user && typeof user.id === 'string' && user.id.trim() !== '') {
                    const parsedId = parseInt(user.id, 10);
                    if (!isNaN(parsedId)) {
                        user.id = parsedId;
                        console.log("TableauUtilisateur: Converted user ID from string to number (final check):", user.id);
                    } else {
                        console.warn("TableauUtilisateur: User ID received is a non-numeric string (final check). Setting ID to null.", user.id);
                        setGlobalError("Erreur: L'ID utilisateur est invalide. Veuillez vous reconnecter.");
                        setCurrentUser(null);
                        setLoading(false);
                        return;
                    }
                } else if (user && (user.id === null || typeof user.id === 'undefined' || user.id === '')) {
                     console.warn("TableauUtilisateur: User ID not found after all attempts. Setting to null.", user.id);
                     user.id = null; // S'assurer qu'il est null si absent après toutes les tentatives
                }

                // Final validation before setting currentUser state
                if (user && (user.id || user.id === 0) && (user.role === 'UTILISATEUR' || user.role === 'USER')) { 
                    setCurrentUser(user);
                    setGlobalError(null); 
                } else {
                    setCurrentUser(null);
                    setGlobalError("Accès refusé : Informations utilisateur incomplètes ou rôle non autorisé.");
                    console.error("TableauUtilisateur: User is not of role 'UTILISATEUR' or 'USER', or ID is missing/invalid. Current Role:", user?.role, "Current ID:", user?.id);
                }
            } catch (err) {
                console.error("TableauUtilisateur: Erreur lors de la récupération des données utilisateur:", err);
                setCurrentUser(null);
                setGlobalError("Erreur de connexion. Veuillez vous reconnecter.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []); 

    // Fetch User Consultations (dépend de currentUser.id)
    const fetchConsultations = useCallback(async () => {
        // Condition stricte: n'appelle que si currentUser et currentUser.id sont des nombres valides
        if (!currentUser || typeof currentUser.id !== 'number' || isNaN(currentUser.id)) { 
            setConsultationsPassees([]); 
            setConsultationsError(null); 
            console.warn("TableauUtilisateur: Skipping consultation fetch as currentUser or currentUser.id is invalid/non-numeric.");
            return;
        }
        setConsultationsError(null); 
        try {
            const data = await getConsultationsUtilisateur(); 
            setConsultationsPassees(data);
        } catch (err) {
            console.error("TableauUtilisateur: Erreur de chargement des consultations passées:", err);
            setConsultationsError("Impossible de charger vos consultations passées."); 
        }
    }, [currentUser]); 

    // Déclenche le chargement des données quand currentUser change
    useEffect(() => {
        if (currentUser && typeof currentUser.id === 'number' && !isNaN(currentUser.id)) { 
            fetchConsultations();
        }
    }, [currentUser, fetchConsultations]);

    const formatDateTime = (dateString, timeString = '') => {
        if (!dateString) return 'N/A';
        try {
            let dateTime;
            if (timeString) {
                dateTime = new Date(`${dateString}T${timeString}`);
            } else {
                dateTime = new Date(dateString);
            }
            
            if (isNaN(dateTime.getTime())) {
                console.warn("Invalid date format detected for:", dateString, timeString);
                return `${dateString}${timeString ? ' ' + timeString : ''}`; 
            }

            return dateTime.toLocaleString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: timeString ? '2-digit' : undefined, 
                minute: timeString ? '2-digit' : undefined
            });
        } catch (e) {
            console.error("Erreur de formatage de date/heure:", e);
            return `${dateString}${timeString ? ' ' + timeString : ''}`; 
        }
    };

    // Gestion du chargement initial du tableau de bord
    if (loading) {
        return <Layout><div className="text-center py-8 text-gray-600">Chargement du tableau de bord...</div></Layout>;
    }

    // Gestion des erreurs d'accès ou de non-authentification (affichées en haut)
    if (globalError && (!currentUser || !currentUser.role || (currentUser.role !== 'UTILISATEUR' && currentUser.role !== 'USER'))) { 
        return <Layout><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto mt-8 max-w-2xl">{globalError}</div></Layout>;
    }

    // Si l'utilisateur n'est pas un USER ou si currentUser est null après chargement
    if (!currentUser || (currentUser.role !== 'UTILISATEUR' && currentUser.role !== 'USER')) {
        return <Layout><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto mt-8 max-w-2xl">Vous n'avez pas les autorisations nécessaires pour accéder à ce tableau de bord.</div></Layout>;
    }

    // DEBUG: Log the currentUser object and its ID right before rendering MesReservations
    console.log("TableauUtilisateur Render (before MesReservations): currentUser object:", currentUser);
    console.log("TableauUtilisateur Render (before MesReservations): currentUser.id:", currentUser?.id);
    console.log("TableauUtilisateur Render (before MesReservations): Type of currentUser.id:", typeof currentUser?.id);


    // Détermine si utilisateurId est valide pour le rendu de MesReservations
    const isUtilisateurIdValidForReservations = currentUser && typeof currentUser.id === 'number' && !isNaN(currentUser.id);

    const renderSection = () => {
        switch (activeTab) {
            case 'reservations':
                return (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes Réservations</h2>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            {isUtilisateurIdValidForReservations ? (
                                <MesReservations 
                                    utilisateurId={currentUser.id} // Prop renommée
                                    onError={setGlobalError} 
                                    onShowConfirm={handleShowConfirmModal} 
                                    onShowInfo={handleShowInfoModal}
                                    onSuccessfulAction={() => { 
                                        setSuccessMessage("Action effectuée avec succès !"); 
                                    }}
                                />
                            ) : (
                                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
                                    Impossible d'afficher les réservations : l'ID de l'utilisateur n'est pas disponible ou invalide.
                                    Veuillez vous assurer que vous êtes connecté et que votre profil est complet.
                                </div>
                            )}
                        </div>
                    </section>
                );
            case 'consultations':
                return (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes Consultations Passées</h2>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            {consultationsError ? ( 
                                <p className="text-red-500">{consultationsError}</p>
                            ) : consultationsPassees.length === 0 ? (
                                <p className="text-gray-600">Vous n'avez pas d'historique de consultations pour le moment.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professionnel</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée (min)</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lien Visio</th> 
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {consultationsPassees.map((con) => (
                                                <tr key={con.idConsultation}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDateTime(con.dateConsultation, con.heure)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {con.professionnel ? `Dr. ${con.professionnel.prenom} ${con.professionnel.nom}` : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{con.prix} MAD</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{con.dureeMinutes}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {con.lienVisio ? (
                                                            <a href={con.lienVisio} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                                Rejoindre
                                                            </a>
                                                        ) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                );
            case 'humeur':
                return (
                    <section>
                        <SuiviHumeur currentUser={currentUser} />
                    </section>
                );
            case 'profil':
                return (
                    <section className="bg-white shadow-lg rounded-lg p-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                            Modifier votre profil
                        </h2>
                        <FormulaireProfil currentUser={currentUser} onProfileUpdate={() => setSuccessMessage("Profil mis à jour avec succès!")} />
                    </section>
                );
            case 'forum': // NOUVEL ONGLET POUR LE FORUM
                return (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Forum Communautaire</h2>
                        <ForumSujets 
                            onShowInfo={handleShowInfoModal} 
                            onError={setGlobalError} 
                        />
                    </section>
                );
            default:
                return (
                    <div className="p-4 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Aperçu de votre Espace</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-purple-100 p-3 rounded-md text-purple-800 text-sm">Aperçu rapide de vos activités.</div>
                            <div className="bg-orange-100 p-3 rounded-md text-orange-800 text-sm">Consultez vos messages récents et notifications.</div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row h-full md:h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-full md:w-60 bg-indigo-700 text-white flex-shrink-0 flex flex-col shadow-lg p-4">
                    <div className="p-4 text-center text-xl font-bold border-b border-indigo-600 mb-4">
                        <span className="text-indigo-200">Psy</span><span className="text-white">Connect</span> Utilisateur
                    </div>
                    <nav className="flex-grow">
                        <ul>
                            <li className="mb-1">
                                <button
                                    className={`w-full text-left px-4 py-2 flex items-center text-sm transition-colors duration-200 rounded-md ${activeTab === 'reservations' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-800'}`}
                                    onClick={() => setActiveTab('reservations')}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Mes Réservations
                                </button>
                            </li>
                            <li className="mb-1">
                                <button
                                    className={`w-full text-left px-4 py-2 flex items-center text-sm transition-colors duration-200 rounded-md ${activeTab === 'consultations' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-800'}`}
                                    onClick={() => setActiveTab('consultations')}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                    Historique Consultations
                                </button>
                            </li>
                            <li className="mb-1">
                                <button
                                    className={`w-full text-left px-4 py-2 flex items-center text-sm transition-colors duration-200 rounded-md ${activeTab === 'humeur' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-800'}`}
                                    onClick={() => setActiveTab('humeur')}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Suivi d'Humeur
                                </button>
                            </li>
                            <li className="mb-1">
                                <button
                                    className={`w-full text-left px-4 py-2 flex items-center text-sm transition-colors duration-200 rounded-md ${activeTab === 'profil' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-800'}`}
                                    onClick={() => setActiveTab('profil')}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Mon Profil
                                </button>
                            </li>
                            {/* NOUVEL ONGLET POUR LE FORUM */}
                            <li className="mb-1">
                                <button
                                    className={`w-full text-left px-4 py-2 flex items-center text-sm transition-colors duration-200 rounded-md ${activeTab === 'forum' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-800'}`}
                                    onClick={() => setActiveTab('forum')}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    Forum
                                </button>
                            </li>
                        </ul>
                    </nav>
                    <div className="p-3 border-t border-indigo-600 mt-auto">
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {activeTab === 'profil' ? 'Mon Profil' :
                                activeTab === 'humeur' ? "Mon Suivi d'Humeur" :
                                    activeTab === 'reservations' ? 'Mes Réservations' :
                                        activeTab === 'consultations' ? 'Historique des Consultations' :
                                            activeTab === 'forum' ? 'Forum Communautaire' : 
                                            'Espace Utilisateur'}
                        </h1>
                    </header>

                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
                        {/* Global error messages (for authentication/access issues) */}
                        {globalError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                {globalError}
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                                {successMessage}
                            </div>
                        )}
                        {renderSection()}
                    </main>
                </div>

                {/* Modal de confirmation personnalisé */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center rounded-xl"> 
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{confirmModalTitle}</h3>
                            <p className="text-gray-700 mb-6">{confirmModalMessage}</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModalAction) {
                                            confirmModalAction(); 
                                        }
                                    }}
                                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal d'information personnalisé */}
                {showInfoModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full rounded-xl"> 
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{infoModalTitle}</h3>
                            <div className="whitespace-pre-wrap text-gray-700 mb-6">{infoModalContent}</div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowInfoModal(false)}
                                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TableauUtilisateur;
