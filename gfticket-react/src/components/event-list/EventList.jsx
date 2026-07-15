import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../services/eventService';



export function EventList() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

    return (
        <div>
            <section className="ListaEventos">
            <h2>Listado de Eventos</h2>
            <p>Aquí se mostrarán los eventos disponibles.</p>
            </section>
            {loading && <p>Cargando eventos...</p>}
            {!loading && error && <div className="alert alert-danger" role="alert">Error al cargar los eventos.</div>}
            {events.length === 0 && !loading && !error && <p>No hay eventos disponibles.</p>}
            {events.length > 0 && (
                <div>
                    <span> Hay {events.length} eventos disponibles</span>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Rango Precio</th>
                                <th>Localidad</th>
                                <th>Género</th>
                                <th>Recinto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((evento) => (
                                <tr key={evento.id}>
                                    <td><Link to={`/eventos/${evento.id}`}>{evento.nombre}</Link></td>
                                    <td>{evento.fechaEvento}</td>
                                    <td>{evento.horaEvento}</td>
                                    <td>{evento.precioMinimo ?? 'N/A'}€ ~ {evento.precioMaximo ?? 'N/A'}€</td>
                                    <td>{evento.localidad}</td>
                                    <td>{evento.genero}</td>
                                    <td>{evento.nombreRecinto}</td>
                                    {/*
                                    <td>
                                        <button onClick={() => handleDelete(evento.id)}>🗑️</button>
                                    </td>
                                    */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
