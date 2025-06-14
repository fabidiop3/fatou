// src/components/utilisateur/MesReservations.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getReservationsPourUtilisateur, annulerReservation, lancerPaiement, telechargerRecu } from '../../services/serviceUtilisateur';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle, faInfoCircle, faPaperPlane, faDownload } from '@fortawesome/free-solid-svg-icons';
import { getCurrentUserInfo } from '../../services/serviceAuth';

// Renommage de la prop de 'userId' à 'utilisateurId'
const MesReservations = ({ utilisateurId, onError, onShowConfirm, onShowInfo, onSuccessfulAction }) => { 
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Pour le rôle et l'ID d'affichage

    useEffect(() => {
        const user = getCurrentUserInfo();
        setCurrentUser(user);
    }, []);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Assurez-vous que l'utilisateur est authentifié et que l'ID est valide avant de faire la requête
        if (!utilisateurId || (typeof utilisateurId !== 'number' && typeof utilisateurId !== 'string') || isNaN(parseInt(utilisateurId, 10))) {
            console.warn("MesReservations: Utilisateur ID est invalide ou manquant. Impossible de charger les réservations.");
            setError("Impossible de charger les réservations : ID utilisateur manquant ou invalide.");
            onError("Impossible de charger les réservations : ID utilisateur manquant ou invalide. Veuillez vous reconnecter.");
            setLoading(false);
            setReservations([]);
            return;
        }

        try {
            // Passez utilisateurId à la fonction du service
            const data = await getReservationsPourUtilisateur(utilisateurId); 
            setReservations(data);
            console.log("MesReservations: Réservations chargées:", data);
        } catch (err) {
            console.error("MesReservations: Erreur de chargement des réservations:", err);
            setError("Impossible de charger vos réservations. Veuillez réessayer.");
            onError(err.message || "Erreur inconnue lors du chargement des réservations.");
        } finally {
            setLoading(false);
        }
    }, [utilisateurId, onError]); // Dépend de utilisateurId

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleAnnulerReservation = (reservationId) => {
        onShowConfirm(
            "Confirmer l'annulation",
            "Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.",
            async () => {
                try {
                    setLoading(true);
                    await annulerReservation(reservationId);
                    onSuccessfulAction(); // Notifie le parent pour afficher un succès global
                    onShowInfo("Annulation réussie", "Votre réservation a été annulée avec succès.");
                    fetchReservations(); // Recharger les réservations
                } catch (err) {
                    console.error("Erreur annulation:", err);
                    onShowInfo("Erreur d'annulation", err.message || "Impossible d'annuler la réservation.");
                    setError("Échec de l'annulation de la réservation.");
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const handlePaiement = (reservationId) => {
        onShowConfirm(
            "Confirmer le paiement",
            "Voulez-vous procéder au paiement de cette consultation ?",
            async () => {
                try {
                    setLoading(true);
                    // Le mode de paiement est généralement une valeur fixe pour la simulation, ou choisie par l'utilisateur
                    await lancerPaiement(reservationId, "VIREMENT_BANCAIRE"); 
                    onSuccessfulAction();
                    onShowInfo("Paiement initié", "Le processus de paiement a été initié. Veuillez consulter votre email pour les instructions ou vérifier le statut de votre réservation.");
                    fetchReservations(); // Recharger les réservations
                } catch (err) {
                    console.error("Erreur paiement:", err);
                    onShowInfo("Erreur de paiement", err.message || "Impossible d'initier le paiement.");
                    setError("Échec de l'initiation du paiement.");
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const handleTelechargerRecu = async (reservationId) => {
        try {
            setLoading(true);
            const blob = await telechargerRecu(reservationId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `recu_reservation_${reservationId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            onShowInfo("Reçu téléchargé", "Votre reçu a été téléchargé avec succès.");
            onSuccessfulAction();
        } catch (err) {
            console.error("Erreur téléchargement reçu:", err);
            onShowInfo("Erreur de téléchargement", err.message || "Impossible de télécharger le reçu. Veuillez réessayer plus tard.");
            setError("Échec du téléchargement du reçu.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMEE':
                return 'bg-green-100 text-green-800';
            case 'EN_ATTENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'ANNULEE':
                return 'bg-red-100 text-red-800';
            case 'PAYEE':
                return 'bg-blue-100 text-blue-800';
            case 'EN_ATTENTE_PAIEMENT':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10 text-gray-600">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mr-3" />
                Chargement de vos réservations...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4 flex items-center">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                {error}
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative my-4 flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                Vous n'avez aucune réservation pour le moment.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professionnel</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reservation.heureReservation}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reservation.professionnel ? `Dr. ${reservation.professionnel.prenom} ${reservation.professionnel.nom}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(reservation.statut)}`}>
                                    {reservation.statut}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {reservation.statut === 'EN_ATTENTE' && (
                                    <button
                                        onClick={() => handleAnnulerReservation(reservation.id)}
                                        className="text-red-600 hover:text-red-900 mr-4 transition duration-150 ease-in-out"
                                        title="Annuler la réservation"
                                    >
                                        Annuler
                                    </button>
                                )}
                                {reservation.statut === 'EN_ATTENTE_PAIEMENT' && (
                                    <button
                                        onClick={() => handlePaiement(reservation.id)}
                                        className="text-blue-600 hover:text-blue-900 mr-4 flex items-center justify-center transition duration-150 ease-in-out"
                                        title="Payer la réservation"
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="mr-1" /> Payer
                                    </button>
                                )}
                                {reservation.statut === 'PAYEE' && (
                                    <button
                                        onClick={() => handleTelechargerRecu(reservation.id)}
                                        className="text-purple-600 hover:text-purple-900 mr-4 flex items-center justify-center transition duration-150 ease-in-out"
                                        title="Télécharger le reçu"
                                    >
                                        <FontAwesomeIcon icon={faDownload} className="mr-1" /> Reçu
                                    </button>
                                )}
                                {/* Ajoutez d'autres actions selon les statuts */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MesReservations;
