import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, deleteEventById } from '../../services/eventService';
import './EventDetailComponent.css';

export function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    //Error check containing loadingError message
    const [loadingError, setLoadingError] = useState(null);
    //Inline delete confirmation open? (single event here, a boolean is enough)
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleteError, setDeleteError] = useState(false);

    //Runs only after the inline confirmation: by here the user already said yes
    const handleDelete = async () => {
        setConfirmingDelete(false);
        setDeleteError(false);
        try {
            await deleteEventById(id);
            //This page's event no longer exists: programmatic navigation back to the list
            navigate('/eventos');
        } catch (err) {
            console.error(err);
            setDeleteError(true);
        }
    };

    useEffect(() => {
        //A stale fetch (unmount, or id changed mid-flight) must not reach state
        let ignore = false;
        setLoading(true);
        setLoadingError(null);

        const fetchEvent = async () => {
            try {
                const data = await getEventById(id);
                if (!ignore) setEvento(data);
            } catch (err) {
                console.error(err);
                if (!ignore) setLoadingError(err.message === 'Error 404' ? 'notfound' : 'error');
            } finally {
                if (!ignore) setLoading(false);
            }
        };
        fetchEvent();

        return () => { ignore = true; };
    }, [id]); //navigating from /eventos/1 to /eventos/2 must refetch

    return (
        <section className="event-detail">
            <div className="event-detail__toolbar">
                <Link className="event-detail__back" to="/eventos">← Volver al listado</Link>
                {/*No actions while loading or on error: there is nothing (confirmed) to act on*/}
                {!loading && !loadingError && evento && (
                    confirmingDelete ? (
                        //Inline confirmation replaces the toolbar actions until answered
                        <div className="event-detail__actions">
                            <span className="event-detail__confirm-label">¿Eliminar?</span>
                            <button
                                className="event-detail__confirm-yes"
                                aria-label={`Confirmar eliminación de ${evento.nombre}`}
                                onClick={handleDelete}>
                                Sí
                            </button>
                            <button
                                className="event-detail__confirm-no"
                                aria-label={`Cancelar eliminación de ${evento.nombre}`}
                                onClick={() => setConfirmingDelete(false)}>
                                No
                            </button>
                        </div>
                    ) : (
                        <div className="event-detail__actions">
                            <Link className="event-detail__edit" to={`/eventos/edit/${id}`}>
                                ✏️ Editar
                            </Link>
                            <button
                                className="event-detail__delete"
                                aria-label={`Eliminar ${evento.nombre}`}
                                onClick={() => setConfirmingDelete(true)}>
                                🗑️ Eliminar
                            </button>
                        </div>
                    )
                )}
            </div>
            {deleteError && <div className="alert alert-danger" role="alert">No se pudo eliminar el evento.</div>}
            {loading && <p className="event-detail__status">Cargando evento...</p>}
            {!loading && loadingError === 'notfound' && (
                <div className="alert alert-danger" role="alert">Evento con id: {id} no encontrado.</div>
            )}
            {!loading && loadingError === 'error' && (
                <div className="alert alert-danger" role="alert">No se pudo cargar el evento con id: {id}.</div>
            )}
            {!loading && !loadingError && evento && (
                <div className="event-detail__layout">
                    <div>
                        <span className="event-detail__genre">{evento.genero}</span>
                        <h2 className="event-detail__title">{evento.nombre}</h2>
                        <dl className="event-detail__meta">
                            <div className="event-detail__meta-item">
                                <dt>Fecha</dt>
                                <dd>{evento.fechaEvento}</dd>
                            </div>
                            <div className="event-detail__meta-item">
                                <dt>Hora</dt>
                                <dd>{evento.horaEvento}</dd>
                            </div>
                            <div className="event-detail__meta-item">
                                <dt>Localidad</dt>
                                <dd>{evento.localidad}</dd>
                            </div>
                            <div className="event-detail__meta-item">
                                <dt>Recinto</dt>
                                <dd>{evento.nombreRecinto}</dd>
                            </div>
                        </dl>
                        <p className="event-detail__price">
                            <span className="event-detail__price-label">Precio</span>
                            <span className="event-detail__price-value">
                                {evento.precioMinimo ?? 'N/A'}€ ~ {evento.precioMaximo ?? 'N/A'}€
                            </span>
                        </p>
                        <p className="event-detail__description">{evento.descripcion}</p>
                    </div>
                    <img className="event-detail__image" src={evento.imagenUrl} alt={evento.nombre} />
                </div>
            )}
        </section>
    );
}
