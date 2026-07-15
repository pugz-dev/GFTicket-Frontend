import { useParams, Link } from 'react-router-dom';
import { getEventById } from '../../services/eventService';

export function EventDetail() {
    const { id } = useParams();
    const event = getEventById( id );
    return (
        <section className="EventDetail">
            
            <Link to="/eventos/">← Volver al listado</Link>
        </section>
    );
}