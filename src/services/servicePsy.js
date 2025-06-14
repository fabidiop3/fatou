// src/services/serviceProfessionnel.js
import api from './api'; 

// Disponibilités
export const getDisponibilites = async () => {
  const response = await api.get('/disponibilites'); 
  return response.data;
};

export const ajouterDisponibilite = async (dispoData) => {
  const response = await api.post('/disponibilites', dispoData); 
  return response.data;
};

export const modifierDisponibilite = async (id, dispoData) => {
  const response = await api.put(`/disponibilites/${id}`, dispoData); 
  return response.data;
};

export const supprimerDisponibilite = async (id) => {
  const response = await api.delete(`/disponibilites/${id}`); 
  return response.data;
};

// Consultations (pour le professionnel)
export const getConsultations = async () => {
  const response = await api.get('/professionnel/consultations'); 
  return response.data;
};

export const modifierConsultation = async (id, consultationData) => {
  const response = await api.put(`/professionnel/consultations/${id}`, consultationData);
  return response.data;
};

// Réservations (pour le professionnel)
export const getReservations = async () => {
  const response = await api.get('/professionnel/reservations');
  return response.data;
};

// Nouvelle fonction pour mettre à jour le statut d'une réservation
export const updateReservationStatus = async (reservationId, newStatus) => {
    // Supposons que le backend attend un objet { statut: "NOUVEAU_STATUT" }
    const response = await api.put(`/professionnel/reservations/${reservationId}/status`, { statut: newStatus });
    return response.data;
};

// Messagerie (pour le professionnel)
export const envoyerMessage = async (messageData) => {
  const response = await api.post('/professionnel/messages', messageData);
  return response.data;
};

export const getMessages = async () => {
  const response = await api.get('/professionnel/messages');
  return response.data;
};

// Récupère les disponibilités d'un professionnel spécifique, filtrées par date (utilisé par l'utilisateur)
export const getDisponibilitesFiltrees = async (proId, date) => {
    try {
        // date est déjà au format YYYY-MM-DD depuis le front-end.
        // Pas besoin de .toISOString().split('T')[0] si selectedDate est déjà au bon format.
        const response = await api.get(`/disponibilites/filtrees/${proId}?date=${date}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des disponibilités filtrées pour le pro ${proId} à la date ${date}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- NOUVELLES FONCTIONS (pour la recherche de professionnels) ---

/**
 * Récupère la liste de tous les professionnels validés.
 * Correspond à GET /api/professionnels
 * @returns {Promise<Array<object>>} Liste des objets ProfessionnelSanteMentale.
 */
export const getAllProfessionnels = async () => {
    try {
        const response = await api.get('/professionnels'); // Endpoint qui devrait retourner les validés par défaut
        console.log("ServiceProfessionnel: Liste des professionnels récupérée:", response.data);
        return response.data;
    } catch (error) {
        console.error("ServiceProfessionnel: Erreur lors de la récupération de tous les professionnels:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Récupère les détails d'un professionnel spécifique par son ID.
 * Correspond à GET /api/professionnels/{id}
 * @param {number} id - L'ID du professionnel.
 * @returns {Promise<object>} L'objet ProfessionnelSanteMentale.
 */
export const getProfessionnelById = async (id) => {
    try {
        const response = await api.get(`/professionnels/${id}`);
        console.log(`ServiceProfessionnel: Détails du professionnel ${id} récupérés:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`ServiceProfessionnel: Erreur lors de la récupération du professionnel ${id}:`, error.response?.data || error.message);
        throw error;
    }
};
