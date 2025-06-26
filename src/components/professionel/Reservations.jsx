import React, { useEffect, useState } from 'react';
import { getReservations, updateReservationStatus } from '../../services/servicePsy';
import { CheckCircle, XCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reservations = ({ proId }) => {
  const [reservations, setReservations] = useState([]);
  const [filtre, setFiltre] = useState('TOUTES');
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

      // Notification toast selon action
      if (status === 'VALIDE') {
        toast.success("La réservation a été validée.");
      } else if (status === 'REFUSE') {
        toast.error("La réservation a été refusée.");
      }

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

  const reservationsFiltrees = reservations.filter((r) =>
    filtre === 'TOUTES' ? true : mapStatutValidation(r) === filtre
  );

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
          <button
            onClick={() => handleUpdateStatus(id, 'REFUSE')}
            className="text-red-600 hover:text-red-800"
            title="Refuser"
            disabled={updatingId === id}
          >
            <XCircle size={18} />
          </button>
        );
      case 'REFUSE':
        return (
          <button
            onClick={() => handleUpdateStatus(id, 'VALIDE')}
            className="text-green-600 hover:text-green-800"
            title="Valider"
            disabled={updatingId === id}
          >
            <CheckCircle size={18} />
          </button>
        );
      default:
        return null;
    }
  };

  const getStatutMessage = (statut) => {
    switch (statut) {
      case 'VALIDE':
        return <span className="text-green-600 font-medium">Réservation validée</span>;
      case 'REFUSE':
        return <span className="text-red-600 font-medium">Réservation refusée</span>;
      case 'EN_ATTENTE':
      default:
        return <span className="text-gray-600 font-medium">En attente de validation</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-6 flex items-center gap-2">
        <CheckCircle size={24} /> Mes réservations
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Filtres */}
      <div className="mb-4 flex gap-3 flex-wrap">
        {['TOUTES', 'EN_ATTENTE', 'VALIDE', 'REFUSE'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filtre === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {f === 'TOUTES'
              ? 'Toutes'
              : f === 'EN_ATTENTE'
              ? 'En attente'
              : f === 'VALIDE'
              ? 'Validées'
              : 'Refusées'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-blue-600 dark:text-blue-400">Chargement...</p>
      ) : reservationsFiltrees.length === 0 ? (
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
            {reservationsFiltrees.map((reservation) => {
              const statutMapped = mapStatutValidation(reservation);
              const utilisateurNomPrenom = reservation.utilisateur
                ? `${reservation.utilisateur.prenom || ''} ${reservation.utilisateur.nom || ''}`.trim()
                : 'Utilisateur inconnu';

              return (
                <tr key={reservation.id} className="border-t border-gray-300 dark:border-gray-700">
                  <td className="p-2 border border-gray-300 dark:border-gray-700">
                    {new Date(reservation.dateReservation).toLocaleDateString()}
                  </td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700">{reservation.heureConsultation}</td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700">{utilisateurNomPrenom}</td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700">
                    {getStatutMessage(statutMapped)}
                  </td>
                  <td className="p-2 border border-gray-300 dark:border-gray-700 flex gap-2">
                    {renderActions(reservation.id, statutMapped)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Conteneur Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Reservations;
