import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { CheckCircle, XCircle } from 'lucide-react';

const Reservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getReservations(proId);
      setReservations(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des réservations.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proId) {
      fetchReservations();
    } else {
      setLoading(false);
      setError("ID professionnel manquant.");
    }
  }, [proId]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, status);
      await fetchReservations();
      setError(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut.");
      alert("Erreur lors de la mise à jour du statut, veuillez réessayer.");
    } finally {
      setUpdatingId(null);
    }
  };

  const mapStatutValidation = (reservation) => {
    if (reservation.statut === 'PAYEE' || reservation.statut === 'EN_ATTENTE_PAIEMENT') {
      return 'VALIDE';
    }
    if (reservation.statut === 'REFUSE' || reservation.statut === 'ANNULEE') {
      return 'REFUSE';
    }
    return 'EN_ATTENTE';
  };

  // Filtrage par statut
  const reservationsEnAttente = reservations.filter(r => mapStatutValidation(r) === 'EN_ATTENTE');
  const reservationsValide = reservations.filter(r => mapStatutValidation(r) === 'VALIDE');
  const reservationsRefuse = reservations.filter(r => mapStatutValidation(r) === 'REFUSE');

  // Fonction pour afficher les boutons selon statut courant
  const renderActions = (id, statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return (
          <>
            <button
              onClick={() => handleUpdateStatus(id, 'VALIDE')}
              className="text-green-600 hover:text-green-800"
              title="Valider"
              disabled={updatingId === id}
            >
              <CheckCircle size={18} />
            </button>
            <button
              onClick={() => handleUpdateStatus(id, 'REFUSE')}
              className="text-red-600 hover:text-red-800"
              title="Refuser"
              disabled={updatingId === id}
            >
              <XCircle size={18} />
            </button>
          </>
        );
      case 'VALIDE':
        return (
          <>
            
            <button
              onClick={() => handleUpdateStatus(id, 'REFUSE')}
              className="text-red-600 hover:text-red-800"
              title="Refuser"
              disabled={updatingId === id}
            >
              <XCircle size={18} />
            </button>
          </>
        );
      case 'REFUSE':
        return (
          <>
           
            <button
              onClick={() => handleUpdateStatus(id, 'VALIDE')}
              className="text-green-600 hover:text-green-800"
              title="Valider"
              disabled={updatingId === id}
            >
              <CheckCircle size={18} />
            </button>
          </>
        );
      default:
        return null;
    }
  };

  const renderTable = (title, data, statut) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Aucune réservation</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-800 text-left">
              <th className="p-2 border border-gray-300 dark:border-gray-700">Date</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Heure</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Utilisateur</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Statut</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ id, dateReservation, heureConsultation, utilisateur }) => (
              <tr key={id} className="border-t border-gray-300 dark:border-gray-700">
                <td className="p-2 border border-gray-300 dark:border-gray-700">{dateReservation}</td>
                <td className="p-2 border border-gray-300 dark:border-gray-700">{heureConsultation}</td>
                <td className="p-2 border border-gray-300 dark:border-gray-700">{utilisateur?.prenom} {utilisateur?.nom}</td>
                <td className="p-2 border border-gray-300 dark:border-gray-700">{statut.toLowerCase().replace('_', ' ')}</td>
                <td className="p-2 border border-gray-300 dark:border-gray-700 flex gap-2">
                  {renderActions(id, statut)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-6 flex items-center gap-2">
        <CheckCircle size={24} /> Mes réservations
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <p className="text-blue-600 dark:text-blue-400">Chargement...</p>
      ) : (
        <>
          {renderTable('Réservations en attente', reservationsEnAttente, 'EN_ATTENTE')}
          {renderTable('Réservations validées', reservationsValide, 'VALIDE')}
          {renderTable('Réservations refusées', reservationsRefuse, 'REFUSE')}
        </>
      )}
    </div>
  );
};

export default Reservations;
