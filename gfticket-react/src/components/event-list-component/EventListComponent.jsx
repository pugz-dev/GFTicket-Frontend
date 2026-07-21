import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEventById } from '../../services/eventService';
import './EventListComponent.css';



export function EventList() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    //Deleting can fail independently of loading; each failure gets its own message
    const [deleteError, setDeleteError] = useState(false);
    //Id of the event whose delete awaits inline confirmation (null: none).
    const [confirmingId, setConfirmingId] = useState(null);

    const fetchEvents = async () => {
        try {
          const data = await getEvents();
          setEvents(data);
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {

        const timer = setTimeout(() => {
            fetchEvents();
        }, 0);

        return () => clearTimeout(timer);

    }, []);

    //Runs only after the inline confirmation: by here the user already said yes
    const handleDelete = async (id) => {
        setConfirmingId(null);
        setDeleteError(false);
        try {
            await deleteEventById(id);
            //Drop the row locally instead of refecthing the whole list
            setEvents(prev => prev.filter(evento => evento.id !== id));
        } catch (err) {
            console.error(err);
            setDeleteError(true);
        }
    }

    return (
        <section className="event-list">
            <h2 className="event-list__title">Listado de Eventos</h2>
            <p className="event-list__subtitle">Aquí se mostrarán los eventos disponibles.</p>
            {loading && <p className="event-list__status">Cargando eventos...</p>}
            {!loading && error && <div className="alert alert-danger" role="alert">Error al cargar los eventos.</div>}
            {deleteError && <div className="alert alert-danger" role="alert">No se pudo eliminar el evento.</div>}
            {events.length === 0 && !loading && !error && <p className="event-list__status">No hay eventos disponibles.</p>}
            {events.length > 0 && (
                <div>
                    <span className="event-list__count"> Hay {events.length} eventos disponibles</span>
                    <div className="event-list__table-wrapper">
                        <table className="event-list__table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Rango Precio</th>
                                    <th>Localidad</th>
                                    <th>Género</th>
                                    <th>Recinto</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((evento) => (
                                    <tr key={evento.id}>
                                        <td>
                                            <Link className="event-list__link" to={`/eventos/${evento.id}`}>
                                                {evento.nombre}
                                            </Link>
                                        </td>
                                        <td className="event-list__cell--nowrap">{evento.fechaEvento}</td>
                                        <td className="event-list__cell--nowrap">{evento.horaEvento}</td>
                                        <td className="event-list__cell--nowrap">{evento.precioMinimo ?? 'N/A'}€ ~ {evento.precioMaximo ?? 'N/A'}€</td>
                                        <td>{evento.localidad}</td>
                                        <td><span className="event-list__genre">{evento.genero}</span></td>
                                        <td>{evento.nombreRecinto}</td>
                                        {/*One cell for the whole Acciones column: td count must match th count*/}
                                        <td>
                                            {confirmingId === evento.id ? (
                                                //Inline confirmation replaces the row actions until answered
                                                <div className="event-list__actions">
                                                    <span className="event-list__confirm-label">¿Eliminar?</span>
                                                    <button
                                                        className="event-list__confirm-yes"
                                                        aria-label={`Confirmar eliminación de ${evento.nombre}`}
                                                        onClick={() => handleDelete(evento.id)}>
                                                        Sí
                                                    </button>
                                                    <button
                                                        className="event-list__confirm-no"
                                                        aria-label={`Cancelar eliminación de ${evento.nombre}`}
                                                        onClick={() => setConfirmingId(null)}>
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="event-list__actions">
                                                    <Link
                                                        className="event-list__edit"
                                                        to={`/eventos/edit/${evento.id}`}
                                                        aria-label={`Editar ${evento.nombre}`}>
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        className="event-list__delete"
                                                        aria-label={`Eliminar ${evento.nombre}`}
                                                        onClick={() => setConfirmingId(evento.id)}>
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
