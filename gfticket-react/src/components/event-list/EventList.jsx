import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../services/eventService';



export function EventList() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
          const data = await getEvents();
          setEvents(data);
        } catch (err) {
          console.error(err);
          alert('Error loading events.');
        } finally {
          setLoading(false); 
        }
      };

    useEffect(() => {

        const timer = setTimeout(() => {
            fetchLibros();
        }, 0);

        return () => clearTimeout(timer);

    }, []);
    
    return (
        <div>
            <section className="ListaLibros">
            <h2>Listado de Libros</h2>
            <p>Aquí se mostrarán los libros disponibles en la biblioteca.</p>
            </section>
            <input type='text' name='filtroTitulo' placeholder='Filter by title'></input>
            {libros.length === 0 && <p>No hay libros disponibles.</p>}
            {libros.length > 0 && (
                <div>
                    <span> Hay {libros.length} libros disponibles</span>
                    <table>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>Páginas</th>
                                <th>Género</th>
                            </tr>
                        </thead>
                        <tbody>
                            {libros.map((libro) => (
                                <tr key={libro.id}>
                                    <td><Link to={`/libros/${libro.id}`}>{libro.titulo}</Link></td>
                                    <td>{libro.autor}</td>
                                    <td>{libro.paginas}</td>
                                    <td>{darGeneroLibro(libro.genero)}</td>
                                    {/*
                                    <td>
                                        <button onClick={() => handleDelete(libro.id)}>🗑️</button>
                                    </td>
                                    */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/*
            <AltaLibro currentLength={libros.length} onAddLibro={onAddLibro} />
            */}
        </div>
    );
}