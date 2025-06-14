// src/pages/Professionnels/DetailProfessionnel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/commun/Layout';
import { getProfessionnelById, getDisponibilitesFiltrees } from '../../services/servicePsy';
import { reserverConsultation } from '../../services/serviceUtilisateur'; // Pour créer la réservation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faUserMd, faBrain, faPhoneAlt, faEnvelope, faEuroSign, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const DetailProfessionnel = () => {
    const { id } = useParams(); // Récupère l'ID du professionnel depuis l'URL
    const navigate = useNavigate();

    const [professionnel, setProfessionnel] = useState(null);
    const [disponibilites, setDisponibilites] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedDispoId, setSelectedDispoId] = useState(null); // ID de la disponibilité sélectionnée
    const [selectedHeureDebut, setSelectedHeureDebut] = useState(''); // Heure de la dispo sélectionnée
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [reservationMessage, setReservationMessage] = useState('');

    // États pour le modal de confirmation personnalisé
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalTitle, setConfirmModalTitle] = useState('');
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(null);

    // Fonction pour afficher le modal de confirmation
    const handleShowConfirmModal = useCallback((title, message, action) => {
        setConfirmModalTitle(title);
        setConfirmModalMessage(message);
        setConfirmModalAction(() => () => { // Empaqueter l'action pour qu'elle soit exécutable
            action();
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    }, []);

    // Effet pour masquer les messages après un délai
    useEffect(() => {
        if (successMessage || error || reservationMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
                setReservationMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, reservationMessage]);

    // Charger les détails du professionnel
    useEffect(() => {
        const fetchProfessionnel = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getProfessionnelById(id);
                setProfessionnel(data);
                // Initialiser la date sélectionnée à aujourd'hui par défaut pour charger les disponibilités
                const today = new Date();
                setSelectedDate(today.toISOString().split('T')[0]); // Format YYYY-MM-DD
            } catch (err) {
                console.error("Erreur lors de la récupération du professionnel:", err);
                setError("Impossible de charger les détails du professionnel.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionnel();
    }, [id]);

    // Charger les disponibilités filtrées par date et professionnel
    useEffect(() => {
        const fetchDisponibilites = async () => {
            // Vérifie que selectedDate et professionnel.id sont définis
            if (!selectedDate || !professionnel?.id) {
                setDisponibilites([]);
                return;
            }
            try {
                const data = await getDisponibilitesFiltrees(professionnel.id, selectedDate);
                // Les disponibilités sont déjà "découpées" et filtrées par le backend
                // Elles sont prêtes à être affichées comme créneaux disponibles
                setDisponibilites(data);
                setReservationMessage(''); // Efface les messages précédents lors du changement de date
                setSelectedDispoId(null); // Réinitialise la sélection de créneau
                setSelectedHeureDebut('');
            } catch (err) {
                console.error("Erreur lors de la récupération des disponibilités:", err);
                setReservationMessage("Impossible de charger les disponibilités pour cette date.");
                setDisponibilites([]);
            }
        };

        if (professionnel) { // S'assure que le professionnel est chargé avant de fetch les dispos
            fetchDisponibilites();
        }
    }, [selectedDate, professionnel]);


    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSlotSelect = (dispoId, heureDebut) => {
        setSelectedDispoId(dispoId);
        setSelectedHeureDebut(heureDebut);
        setReservationMessage(''); // Efface les messages d'erreur de sélection
    };

    const handleReserver = () => {
        if (!selectedDispoId || !professionnel) {
            setReservationMessage("Veuillez sélectionner un créneau de disponibilité.");
            return;
        }

        // Utilise le modal de confirmation
        handleShowConfirmModal(
            "Confirmer la réservation",
            `Vous êtes sur le point de réserver une consultation avec ${professionnel.prenom} ${professionnel.nom} le ${selectedDate} à ${selectedHeureDebut}. Confirmez-vous ?`,
            async () => {
                try {
                    setLoading(true);
                    setError(null);
                    setSuccessMessage(null);
                    setReservationMessage('');

                    // Trouver la disponibilité complète pour obtenir l'objet Disponibilite à envoyer
                    // (Bien que seul l'ID soit réellement nécessaire côté backend pour l'entité Dispo)
                    const chosenDispo = disponibilites.find(d => d.id === selectedDispoId);

                    const reservationData = {
                        professionnel: { id: professionnel.id }, // L'ID du professionnel
                        disponibilite: { id: chosenDispo.id }, // L'ID de la disponibilité choisie
                        dateReservation: selectedDate, // La date de la disponibilité
                        heureReservation: selectedHeureDebut, // L'heure de début de la disponibilité
                        prix: professionnel.prixConsultation,
                        // message: "Demande de consultation via l'application." // Optionnel
                    };
                    
                    const response = await reserverConsultation(reservationData);
                    setSuccessMessage("Votre réservation a été envoyée avec succès ! En attente de validation par le professionnel.");
                    setReservationMessage(''); // Efface tout message d'erreur précédent
                    
                    // Après la réservation, vous pourriez vouloir rafraîchir les disponibilités pour la date sélectionnée
                    // Ou rediriger l'utilisateur vers son tableau de bord.
                    // Pour l'instant, on recharge les dispos pour montrer le créneau pris (s'il est marqué comme tel par le backend)
                    const updatedDispos = await getDisponibilitesFiltrees(professionnel.id, selectedDate);
                    setDisponibilites(updatedDispos);

                } catch (err) {
                    console.error("Erreur lors de la création de la réservation:", err);
                    setReservationMessage(err.response?.data?.message || "Erreur lors de la réservation de la consultation.");
                    setError("Échec de la réservation."); // Message d'erreur plus général
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    if (loading) {
        return <Layout><div className="text-center py-8 text-gray-600">Chargement du profil professionnel...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto mt-8 max-w-2xl">{error}</div></Layout>;
    }

    if (!professionnel) {
        return <Layout><div className="text-center py-8 text-gray-600">Professionnel non trouvé.</div></Layout>;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{professionnel.prenom} {professionnel.nom}</h1>
                    <p className="text-xl text-indigo-600 font-semibold mb-4">
                        <FontAwesomeIcon icon={faUserMd} className="mr-2" />
                        {professionnel.specialite}
                    </p>
                    <p className="text-gray-700 mb-4">
                        <FontAwesomeIcon icon={faBrain} className="mr-2 text-gray-600" />
                        {professionnel.description || "Ce professionnel n'a pas encore ajouté de description détaillée."}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-600" />
                        Email: {professionnel.email}
                    </p>
                    <p className="text-gray-700 mb-4">
                        <FontAwesomeIcon icon={faPhoneAlt} className="mr-2 text-gray-600" />
                        Téléphone: {professionnel.telephone}
                    </p>
                    {professionnel.prixConsultation !== undefined && professionnel.prixConsultation !== null && (
                        <p className="text-2xl font-bold text-green-700 flex items-center">
                            <FontAwesomeIcon icon={faEuroSign} className="mr-2" />
                            Prix par consultation: {professionnel.prixConsultation.toFixed(2)} MAD
                        </p>
                    )}
                </div>

                {/* Section de Réservation */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Réserver une Consultation</h2>

                    {/* Messages de succès/erreur */}
                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                            {successMessage}
                        </div>
                    )}
                    {reservationMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {reservationMessage}
                        </div>
                    )}

                    <div className="mb-6">
                        <label htmlFor="datePicker" className="block text-gray-700 text-sm font-bold mb-2">
                            Sélectionner une date:
                        </label>
                        <input
                            type="date"
                            id="datePicker"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-indigo-500"
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]} // Empêche de choisir des dates passées
                        />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Créneaux disponibles le {selectedDate}:</h3>
                    {disponibilites.length === 0 ? (
                        <p className="text-gray-600">Aucun créneau disponible pour cette date ou chargement en cours...</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                            {disponibilites.map((dispo) => (
                                <button
                                    key={dispo.id}
                                    onClick={() => handleSlotSelect(dispo.id, dispo.heureDebut)}
                                    className={`p-3 rounded-lg text-center transition-all duration-200 
                                                ${selectedDispoId === dispo.id ? 'bg-indigo-600 text-white shadow-lg border-2 border-indigo-800' : 'bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 border border-gray-200'}
                                                flex flex-col items-center justify-center`}
                                >
                                    <FontAwesomeIcon icon={faClock} className="mb-1 text-lg" />
                                    <span className="font-semibold text-lg">{dispo.heureDebut}</span>
                                    <span className="text-xs">({dispo.heureFin})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedDispoId && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-md border border-indigo-200">
                            <p className="text-indigo-800 font-semibold">
                                Créneau sélectionné: {selectedDate} à {selectedHeureDebut}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleReserver}
                        disabled={!selectedDispoId}
                        className={`w-full py-3 px-6 rounded-md text-lg font-semibold transition-colors duration-300 ${
                            selectedDispoId
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        Confirmer la Réservation
                    </button>
                </div>

                {/* Modal de confirmation personnalisé (peut être réutilisé du TableauUtilisateur si défini globalement) */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{confirmModalTitle}</h3>
                            <p className="text-gray-700 mb-6">{confirmModalMessage}</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModalAction) {
                                            confirmModalAction(); 
                                        }
                                    }}
                                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DetailProfessionnel;
