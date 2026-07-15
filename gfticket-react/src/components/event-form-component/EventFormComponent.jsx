import { useState } from 'react';
import { INITIAL_EVENTO } from '../../models/eventModel';
import { createEvent } from '../../services/eventService';

export const EventForm = () => {

    const [evento, setEvento] = useState(() => INITIAL_EVENTO);

    //Update form status
    const handleChange = (e) => {
        const { name, value } = e.target;
        //Price fields are stored as numbers, but an emptied input ('') must stay '' — parseInt('') is NaN
        const esPrecio = name === 'precioMinimo' || name === 'precioMaximo';
        setEvento((prev) => ({
            ...prev,
            [name]: esPrecio && value !== '' ? parseInt(value, 10) : value
        }));
    };

    //Show validation errors only if field was touched
    const [touched, setTouched] = useState({});
    const handleBlur = (e) => {
        setTouched(prev => ({ ...prev, [e.target.name]: true }));
    };

    const handleSubmit = async (e) => {
        //Prevent the browser's default full-page reload on submit
        e.preventDefault();

        try {
            await createEvent(evento);
            //Only clear the form once the backend has accepted the event
            setEvento(INITIAL_EVENTO);
            setTouched({});
        } catch (error) {
            //Keep the values so the user can correct and resubmit; error UI pending
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Crear Evento</h2>
            <p>Introduce la información del evento</p>
            <p>
                <label htmlFor="nombre">Nombre: </label>
                <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={evento.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="descripcion">Descripcion: </label>
                <input
                    id="descripcion"
                    type="text"
                    name="descripcion"
                    value={evento.descripcion}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="fechaEvento">Fecha: </label>
                <input
                    id="fechaEvento"
                    type="date"
                    name="fechaEvento"
                    value={evento.fechaEvento}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="horaEvento">Hora: </label>
                <input
                    id="horaEvento"
                    type="time"
                    name="horaEvento"
                    value={evento.horaEvento}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="precioMinimo">Precio mínimo: </label>
                <input
                    id="precioMinimo"
                    type="number"
                    name="precioMinimo"
                    min="0"
                    value={evento.precioMinimo}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="precioMaximo">Precio máximo: </label>
                <input
                    id="precioMaximo"
                    type="number"
                    name="precioMaximo"
                    min="0"
                    value={evento.precioMaximo}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="localidad">Localidad: </label>
                <input
                    id="localidad"
                    type="text"
                    name="localidad"
                    value={evento.localidad}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="genero">Género: </label>
                <input
                    id="genero"
                    type="text"
                    name="genero"
                    value={evento.genero}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="nombreRecinto">Nombre del recinto: </label>
                <input
                    id="nombreRecinto"
                    type="text"
                    name="nombreRecinto"
                    value={evento.nombreRecinto}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <label htmlFor="imagenUrl">URL de la imagen: </label>
                <input
                    id="imagenUrl"
                    type="url"
                    name="imagenUrl"
                    value={evento.imagenUrl}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </p>
            <p>
                <button type="submit">Registrar evento</button>
            </p>
        </form>
    );
}
