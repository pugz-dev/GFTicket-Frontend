import { useState } from 'react';
import { INITIAL_EVENTO } from '../../models/eventModel';
import { createEvent } from '../../services/eventService';

//Shows the active errors of a field, only once the user has left it (touched)
const ValidatorAlert = ({ validators, touched, field }) => {
    const errors = validators[field];
    if (!touched[field] || !Object.values(errors).some(Boolean)) return null;
    return (
        <div className="alert alert-danger" role="alert">
            {errors.required && <div>Este campo es obligatorio.</div>}
            {!errors.required && errors.minlength && <div>Debe tener al menos 3 caracteres.</div>}
            {!errors.required && errors.positiveNumber && <div>Debe ser un valor positivo.</div>}
            {errors.rango && <div>El precio máximo no puede ser menor que el mínimo.</div>}
        </div>
    );
};

export const EventForm = () => {

    const [evento, setEvento] = useState(() => INITIAL_EVENTO);

    //Result of the last submit: 'success' | 'error' | null (nothing to report)
    const [submitStatus, setSubmitStatus] = useState(null);

    //Update form status
    const handleChange = (e) => {
        const { name, value } = e.target;
        //Price fields are stored as numbers, but an emptied input ('') must stay '' — parseInt('') is NaN
        const esPrecio = name === 'precioMinimo' || name === 'precioMaximo';
        setEvento((prev) => ({
            ...prev,
            [name]: esPrecio && value !== '' ? parseInt(value, 10) : value
        }));
        //Any typing means a new attempt: dismiss the previous submit feedback
        setSubmitStatus(null);
    };

    //Show validation errors only if field was touched
    const [touched, setTouched] = useState({});
    const handleBlur = (e) => {
        setTouched(prev => ({ ...prev, [e.target.name]: true }));
    };

    //Each field maps to its error conditions; a field is invalid if any of them is true.
    //descripcion, genero e imagenUrl are optional (until declared otherwise as business rule): no entry here, no validation.
    const validators = {
        nombre: {
            required: evento.nombre.trim() === '',
            minlength: evento.nombre.trim().length < 3,
        },
        fechaEvento: {
            required: evento.fechaEvento === '',
        },
        horaEvento: {
            required: evento.horaEvento === '',
        },
        precioMinimo: {
            required: evento.precioMinimo === '',
            positiveNumber: evento.precioMinimo < 0,

        },
        precioMaximo: {
            required: evento.precioMaximo === '',
            positiveNumber: evento.precioMaximo < 0,
            //Both prices are numbers here (handleChange parses them); '' skips the check
            rango: evento.precioMaximo !== '' && evento.precioMinimo !== ''
                && evento.precioMaximo < evento.precioMinimo,
        },
        localidad: {
            required: evento.localidad.trim() === '',
        },
        nombreRecinto: {
            required: evento.nombreRecinto.trim() === '',
        },
    };

    const isFieldInvalid = (field) =>
        Object.values(validators[field]).some(Boolean);

    const isFormInvalid = Object.keys(validators).some(isFieldInvalid);

    const handleSubmit = async (e) => {
        //Prevent the browser's default full-page reload on submit
        e.preventDefault();

        //The button is disabled, but the form can still be submitted (e.g. Enter key)
        if (isFormInvalid) return;

        try {
            console.log(await createEvent(evento));
            //Only clear the form once the backend has accepted the event
            setEvento(INITIAL_EVENTO);
            setTouched({});
            setSubmitStatus('success');
        } catch (error) {
            //Keep the values so the user can correct and resubmit
            console.error(error);
            setSubmitStatus('error');
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
            <ValidatorAlert validators={validators} touched={touched} field="nombre" />
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
            <ValidatorAlert validators={validators} touched={touched} field="fechaEvento" />
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
            <ValidatorAlert validators={validators} touched={touched} field="horaEvento" />
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
            <ValidatorAlert validators={validators} touched={touched} field="precioMinimo" />
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
            <ValidatorAlert validators={validators} touched={touched} field="precioMaximo" />
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
            <ValidatorAlert validators={validators} touched={touched} field="localidad" />
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
            <ValidatorAlert validators={validators} touched={touched} field="nombreRecinto" />
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
                <button type="submit" disabled={isFormInvalid}>Registrar evento</button>
            </p>
            {/*role="status" (polite live region), not "alert": success is not urgent*/}
            {submitStatus === 'success' && (
                <div className="alert alert-success" role="status">
                    Evento creado correctamente.
                </div>
            )}
            {submitStatus === 'error' && (
                <div className="alert alert-danger" role="alert">
                    No se pudo crear el evento. Inténtalo de nuevo.
                </div>
            )}
        </form>
    );
}
