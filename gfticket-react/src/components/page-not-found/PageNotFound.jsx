import { Link } from "react-router-dom";

export function PageNotFound() {
    return (
        <section className="NotFound">
            <h2>404 - Página no encontrada</h2>
            <p>La página que estás buscando no existe.</p>
            <h4><Link to={'/'}>Volver</Link></h4>
        </section>
    );
}