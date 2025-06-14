// src/pages/Professionnels/ListeProfessionnels.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/commun/Layout';
import { getAllProfessionnels } from '../../services/servicePsy'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserMd, faBrain, faPhoneAlt, faEnvelope, faEuroSign } from '@fortawesome/free-solid-svg-icons'; 

const ListeProfessionnels = () => {
    const [professionnels, setProfessionnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // État pour la barre de recherche textuelle
    const [filterSpecialite, setFilterSpecialite] = useState(''); // État pour le filtre par spécialité

    useEffect(() => {
        const fetchProfessionnels = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllProfessionnels();
                setProfessionnels(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des professionnels:", err);
                setError("Impossible de charger la liste des professionnels. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionnels();
    }, []);

    // Logique de filtrage basée sur le terme de recherche et la spécialité
    const filteredProfessionnels = professionnels.filter(pro => {
        // Recherche textuelle (nom, prénom, spécialité)
        const matchesSearch = pro.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              pro.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (pro.specialite && pro.specialite.toLowerCase().includes(searchTerm.toLowerCase())); 
        
        // Filtrage par spécialité
        const matchesSpecialite = filterSpecialite === '' || (pro.specialite && pro.specialite.toLowerCase() === filterSpecialite.toLowerCase());
        
        return matchesSearch && matchesSpecialite;
    });

    if (loading) {
        return <Layout><div className="text-center py-8 text-gray-600">Chargement des professionnels...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-auto mt-8 max-w-2xl">{error}</div></Layout>;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Trouvez votre professionnel</h1>

                {/* Barre de recherche et filtres */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Rechercher par nom, prénom ou spécialité..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <select
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={filterSpecialite}
                            onChange={(e) => setFilterSpecialite(e.target.value)}
                        >
                            <option value="">Toutes les spécialités</option>
                            <option value="psychologue">Psychologue</option>
                            <option value="psychiatre">Psychiatre</option>
                        </select>
                    </div>
                </div>

                {filteredProfessionnels.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">Aucun professionnel ne correspond à votre recherche.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProfessionnels.map((pro) => (
                            <div key={pro.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-103 hover:shadow-xl">
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <FontAwesomeIcon icon={faUserMd} className="text-indigo-600 text-3xl mr-4" />
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">{pro.prenom} {pro.nom}</h2>
                                            <p className="text-md text-indigo-500 font-semibold">{pro.specialite}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faBrain} className="mr-2 text-gray-500" />
                                        {pro.description || "Aucune description disponible."}
                                    </p>
                                    <p className="text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" />
                                        {pro.email}
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        <FontAwesomeIcon icon={faPhoneAlt} className="mr-2 text-gray-500" />
                                        {pro.telephone}
                                    </p>
                                    {pro.prixConsultation !== undefined && pro.prixConsultation !== null && (
                                        <p className="text-lg font-bold text-green-700 flex items-center mb-4">
                                            <FontAwesomeIcon icon={faEuroSign} className="mr-2" />
                                            Prix consultation : {pro.prixConsultation.toFixed(2)} MAD
                                        </p>
                                    )}
                                    <Link 
                                        to={`/professionnels/${pro.id}`} 
                                        className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
                                    >
                                        Voir le profil et prendre RDV
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ListeProfessionnels;
