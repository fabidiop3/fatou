// src/services/serviceUtilisateur.js
import api from './api';
import { getCurrentUserInfo } from './serviceAuth'; 

// --- Mood Tracking ---
export const getSuiviHumeur = async () => {
    const response = await api.get('/humeurs');
    return response.data;
};

export const ajouterHumeur = async (humeurData) => {
    const response = await api.post('/humeurs', humeurData);
    return response.data;
};

// --- Profil utilisateur ---
export const getProfil = async () => {
    try {
        const authMeResponse = await api.get('/auth/me'); 
        const authMeData = authMeResponse.data;
        const storedUserInfo = getCurrentUserInfo(); 

        const fullProfil = {
            ...storedUserInfo, 
            ...authMeData      
        };

        // Assurez-vous que l'ID est un nombre. Si authMeData ne le fournit pas ou est non-numérique, il sera null.
        if (fullProfil && typeof fullProfil.id === 'string' && fullProfil.id.trim() !== '') {
            const parsedId = parseInt(fullProfil.id, 10);
            if (!isNaN(parsedId)) {
                fullProfil.id = parsedId;
            } else {
                console.warn("getProfil: User ID from API (/auth/me) is a non-numeric string. Setting ID to null.", fullProfil.id);
                fullProfil.id = null; // Invalide, le force à null
            }
        } else if (fullProfil && (fullProfil.id === null || typeof fullProfil.id === 'undefined' || fullProfil.id === '')) {
             console.warn("getProfil: User ID not found in /auth/me response or is empty. Setting ID to null.", fullProfil.id);
             fullProfil.id = null; // Le force à null si absent ou vide
        }


        if (fullProfil.authenticated && (fullProfil.id || fullProfil.id === 0)) { 
            console.log("getProfil: Successfully obtained numeric user ID:", fullProfil.id);
        } else {
            console.warn("getProfil: User ID is missing or invalid after /auth/me fetch and conversion attempts. Current ID:", fullProfil?.id);
        }

        return fullProfil;
    } catch (error) {
        console.error("Erreur profil (getProfil):", error.response ? error.response.data : error.message);
        return getCurrentUserInfo(); 
    }
};

export const modifierProfil = async (profilData) => {
    if (!profilData) throw new Error("Profile data missing.");
    try {
        const response = await api.put('/auth/profile', profilData);
        const currentStoredInfo = getCurrentUserInfo();
        if (currentStoredInfo) {
            const updatedInfo = { ...currentStoredInfo, ...profilData };
            localStorage.setItem('currentUserInfo', JSON.stringify(updatedInfo)); 
        }
        return response.data;
    } catch (error) {
        console.error("Erreur modification profil:", error.response?.data?.message || error.message);
        throw error;
    }
};

// --- Réservations ---

export const reserverConsultation = async (reservationData) => {
    try {
        const response = await api.post('/reservations', reservationData);
        console.log("ServiceUtilisateur: Réservation créée avec succès:", response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur réservation:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Récupère toutes les réservations pour un utilisateur spécifique.
 * Le paramètre 'utilisateurId' en JS est attendu comme un nombre.
 * Endpoint backend: GET /api/reservations/utilisateur/{utilisateurId}
 * @param {number} utilisateurId - L'ID numérique de l'utilisateur pour lequel récupérer les réservations.
 * @returns {Promise<Array<object>>} Liste des objets Reservation.
 */
export const getReservationsPourUtilisateur = async (utilisateurId) => { 
    console.log("getReservationsPourUtilisateur (service): Received utilisateurId =", utilisateurId, " Type:", typeof utilisateurId);

    let idAsNumber;
    // Validation stricte de l'ID avant l'appel API
    if (typeof utilisateurId === 'string' && utilisateurId.trim() !== '') {
        const parsed = parseInt(utilisateurId, 10);
        if (!isNaN(parsed)) {
            idAsNumber = parsed;
        } else {
            console.error(`getReservationsPourUtilisateur: User ID est une chaîne non numérique: "${utilisateurId}". Impossible de procéder.`);
            throw new Error(`Format d'ID utilisateur invalide: "${utilisateurId}". Un nombre était attendu.`);
        }
    } else if (typeof utilisateurId === 'number' && !isNaN(utilisateurId)) {
        idAsNumber = utilisateurId;
    } else {
        console.error("getReservationsPourUtilisateur: User ID est null, undefined, vide ou invalide. Impossible de procéder.");
        throw new Error("User ID non disponible ou invalide. Veuillez vous connecter.");
    }
    
    try {
        // Utilisation du paramètre utilisateurId dans l'URL
        const response = await api.get(`/reservations/utilisateur/${idAsNumber}`); 
        console.log(`ServiceUtilisateur: Réservations pour utilisateur ${idAsNumber} récupérées:`, response.data);
        return response.data;
    } catch (error) {
        console.error("Erreur récupération réservations (API call failed):", error.response?.data || error.message);
        throw error;
    }
};

export const annulerReservation = async (reservationId) => { 
    const userInfo = getCurrentUserInfo(); 
    if (!userInfo || !userInfo.id) {
        console.warn("annulerReservation: User ID non disponible. Impossible d'annuler la réservation.");
        throw new Error("User ID non disponible. Veuillez vous connecter.");
    }
    try {
        const response = await api.delete(`/reservations/annuler/${reservationId}`);
        console.log(`ServiceUtilisateur: Réservation ${reservationId} annulée avec succès.`);
        return response.data;
    } catch (error) {
        console.error(`Erreur annulation réservation ${reservationId}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Consultations utilisateur ---
export const getConsultationsUtilisateur = async () => {
    try {
        // Cet endpoint est censé gérer l'ID via le contexte de sécurité backend
        const response = await api.get('/consultations/utilisateur'); 
        return response.data;
    } catch (error) {
        console.error("Erreur récupération consultations:", error.response?.data || error.message);
        throw error;
    }
};

// --- FONCTIONS DE LA PHASE 2 : PAIEMENT ET REÇU ---

export const lancerPaiement = async (reservationId, paymentMethod) => {
    try {
        const response = await api.post(`/reservations/payer/${reservationId}?modePaiement=${paymentMethod}`);
        console.log(`ServiceUtilisateur: Paiement initié pour réservation ${reservationId} via ${paymentMethod}.`, response.data);
        return response.data; 
    } catch (error) {
        console.error(`ServiceUtilisateur: Erreur lors de l'initiation du paiement pour réservation ${reservationId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const validerPaiement = async (reservationId) => {
    try {
        const response = await api.post(`/reservations/valider-paiement/${reservationId}`);
        console.log(`ServiceUtilisateur: Paiement validé pour réservation ${reservationId}.`, response.data);
        return response.data;
    } catch (error) {
        console.error(`ServiceUtilisateur: Erreur lors de la validation du paiement pour réservation ${reservationId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const telechargerRecu = async (reservationId) => {
    try {
        const response = await api.get(`/reservations/telecharger-recu/${reservationId}`, {
            responseType: 'arraybuffer'
        });
        console.log(`ServiceUtilisateur: Reçu pour réservation ${reservationId} téléchargé.`);
        return response.data; 
    } catch (error) {
        console.error(`ServiceUtilisateur: Erreur lors du téléchargement du reçu pour réservation ${reservationId}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Forum Functions ---
export const getForumSujets = async () => {
    const response = await api.get('/forum/sujets');
    return response.data;
};

export const creerForumSujet = async (titre, contenu, anonyme = false) => {
    const payload = { titre, contenu, anonyme };
    const response = await api.post('/forum/sujets', payload);
    return response.data;
};

export const modifierForumSujet = async (sujetId, titre, contenu) => {
    const payload = { titre, contenu };
    const response = await api.put(`/forum/sujets/${sujetId}`, payload);
    return response.data;
};

export const supprimerForumSujet = async (sujetId) => {
    const response = await api.delete(`/forum/sujets/${sujetId}`);
    return response.data;
};

export const getForumReponses = async (sujetId) => {
    const response = await api.get(`/forum/sujets/reponses/${sujetId}`);
    return response.data;
};

export const envoyerForumReponse = async (sujetId, messageContenu, anonyme = false) => {
    const payload = { message: messageContenu, anonyme };
    const response = await api.post(`/forum/sujets/reponses/${sujetId}`, payload);
    return response.data;
};

export const modifierForumReponse = async (reponseId, message) => {
    const payload = { message };
    const response = await api.put(`/forum/sujets/reponses/modifier/${reponseId}`, payload);
    return response.data;
};

export const supprimerForumReponse = async (reponseId) => {
    const response = await api.delete(`/forum/sujets/reponses/supprimer/${reponseId}`);
    return response.data;
};
