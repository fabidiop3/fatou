// src/services/serviceAuth.js
import api from './api'; 

const USER_INFO_KEY = 'currentUserInfo'; 

export const getCurrentUserInfo = () => {
    const userInfoString = localStorage.getItem(USER_INFO_KEY);
    if (userInfoString) {
        try {
            const userInfo = JSON.parse(userInfoString);
            // Conversion explicite de l'ID en nombre si c'est une chaîne
            if (userInfo && typeof userInfo.id === 'string' && userInfo.id.trim() !== '') {
                const parsedId = parseInt(userInfo.id, 10);
                if (!isNaN(parsedId)) {
                    userInfo.id = parsedId;
                    console.log("serviceAuth: Converted user ID from string to number (from localStorage):", userInfo.id);
                } else {
                    console.warn("serviceAuth: User ID in localStorage is a non-numeric string. Setting ID to null.", userInfo.id);
                    userInfo.id = null; // Invalide, le force à null
                }
            } else if (userInfo && (userInfo.id === null || typeof userInfo.id === 'undefined' || userInfo.id === '')) {
                console.warn("serviceAuth: User ID in localStorage is null, undefined, or empty. Setting ID to null.");
                userInfo.id = null; // Le force à null si absent ou vide
            }
            return userInfo;
        } catch (e) {
            console.error("serviceAuth: Erreur lors de l'analyse des informations utilisateur depuis localStorage:", e);
            localStorage.removeItem(USER_INFO_KEY); 
            return null;
        }
    }
    return null;
};

export const login = async (email, motDePasse) => {
    console.log(`serviceAuth: Tentative de connexion pour ${email} vers ${api.defaults.baseURL}/auth/login`);
    try {
        const response = await api.post('/auth/login', { email, motDePasse });
        console.log("serviceAuth: Connexion réussie, backend response.data:", response.data); 

        const userInfo = response.data; 

        // Tente de convertir l'ID en nombre s'il est présent et est une chaîne (vient du backend)
        if (userInfo && typeof userInfo.id === 'string' && userInfo.id.trim() !== '') {
            const parsedId = parseInt(userInfo.id, 10);
            if (!isNaN(parsedId)) {
                userInfo.id = parsedId;
                console.log("serviceAuth: Converted user ID from string to number (from login response):", userInfo.id);
            } else {
                console.warn("serviceAuth: ID received from backend on login is a non-numeric string. Setting ID to null.", userInfo.id);
                userInfo.id = null; // Invalide, le force à null
            }
        } else if (userInfo && (userInfo.id === null || typeof userInfo.id === 'undefined' || userInfo.id === '')) {
             console.warn("serviceAuth: ID not found in login response or is empty. Setting ID to null.");
             userInfo.id = null; // Le force à null si absent ou vide
        }

        // Vérifie la présence de l'ID après toute tentative de conversion
        if (userInfo && (userInfo.id || userInfo.id === 0) && userInfo.email && userInfo.role) { 
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
            window.dispatchEvent(new Event('storage')); 
            console.log(`serviceAuth: Informations utilisateur complètes (ID: ${userInfo.id}, Role: ${userInfo.role}) stockées dans localStorage.`);
        } else {
            console.warn("serviceAuth: La réponse de connexion du backend est incomplète (manque ID, email ou rôle après conversion). Stockage des informations partielles.", userInfo);
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo)); 
            window.dispatchEvent(new Event('storage')); 
        }

        return userInfo; 
    } catch (error) {
        console.error("serviceAuth: Erreur de connexion:", error.response ? error.response.data : error.message, error);
        throw error;
    }
};

export const logout = async () => {
    console.log(`serviceAuth: Tentative de déconnexion vers ${api.defaults.baseURL}/auth/logout`);
    try {
        await api.post('/auth/logout'); 
        console.log("serviceAuth: Requête de déconnexion envoyée avec succès au backend.");
    } catch (error) {
        console.error("serviceAuth: Erreur lors de la déconnexion backend:", error.response ? error.response.data : error.message, error);
    } finally {
        localStorage.removeItem(USER_INFO_KEY); 
        window.dispatchEvent(new Event('storage')); 
        console.log("serviceAuth: Informations utilisateur effacées de localStorage.");
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register/user', userData); 
        return response.data;
    } catch (error) {
        console.error("serviceAuth: Erreur lors de l'inscription utilisateur:", error.response?.data || error.message);
        throw error;
    }
};

export const registerProfessional = async (proData) => {
    try {
        const response = await api.post('/auth/register/professional', proData); 
        return response.data;
    } catch (error) {
        console.error("serviceAuth: Erreur lors de l'inscription professionnel:", error.response?.data || error.message);
        throw error;
    }
};
