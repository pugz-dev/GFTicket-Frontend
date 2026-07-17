import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { INITIAL_EVENTO } from '../../models/eventModel';
import { createEvent, getEventById, updateEventById } from '../../services/eventService';
import './EventFormComponent.css';

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

    //Adapting form to work for updating as well as creating
    const { id } = useParams(); 
    //Status for fetching the event to update, doesn't hinder if in create mode aka no id received
    const [loading, setLoading] = useState(!!id);
    //Error check containing error message
    const [error, setError] = useState(null);

    //Result of the last submit: 'success' | 'error' | null (nothing to report)
    const [submitStatus, setSubmitStatus] = useState(null);

    //Show validation errors only if field was touched
    const [touched, setTouched] = useState({});

    useEffect(() => {
        //If in update mode, set field values to the existing event
        if(id){
            //A stale fetch (unmount, or id changed mid-flight) must not reach state
            let ignore = false;
            setLoading(true);
            setError(null);
    
            const fetchEvent = async () => {
                try {
                    const data = await getEventById(id);
                    if (!ignore) setEvento(data);
                } catch (err) {
                    console.error(err);
                    if (!ignore) setError(err.message === 'Error 404' ? 'notfound' : 'error');
                } finally {
                    if (!ignore) setLoading(false);
                }
            };
            fetchEvent();
    
            return () => { ignore = true; };
        }else{
            //reset all into create mode 
            setEvento(INITIAL_EVENTO);
            setTouched({});
            setLoading(false);
            setSubmitStatus(null);
            setError(null);
        }
    }, [id]); //navigating from /eventos/1 to /eventos/2 must refetch

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

    //A field is mandatory if it has a validators entry: that presence is static metadata,
    //The --required modifier paints the red asterisk from CSS (label::after).
    const fieldClass = (field, full = false) =>
        'event-form__field'
        + (full ? ' event-form__field--full' : '')
        + (field in validators ? ' event-form__field--required' : '');

    const handleSubmit = async (e) => {
        //Prevent the browser's default full-page reload on submit
        e.preventDefault();

        //The button is disabled, but the form can still be submitted (e.g. Enter key)
        if (isFormInvalid) return;

        try {
            console.log(await (id ? updateEventById(id, evento) : createEvent(evento)));

            //Only clear the form in create mode and once the backend has accepted the event
            if(!id)setEvento(INITIAL_EVENTO);

            setTouched({});
            setSubmitStatus('success');
        } catch (err) {
            //Keep the values so the user can correct and resubmit
            console.error(err);
            setSubmitStatus('error');
        }
    };

    return (
        <>
        {loading && <p className="event-form__status">Cargando evento...</p>}
            {!loading && error === 'notfound' && (
                <div className="alert alert-danger" role="alert">Evento con id: {id} no encontrado.</div>
            )}
            {!loading && error === 'error' && (
                <div className="alert alert-danger" role="alert">No se pudo cargar el evento con id: {id}.</div>
            )}
            {!loading && !error && evento && (
            <form className="event-form" onSubmit={handleSubmit}>
                <h2 className="event-form__title">Crear Evento</h2>
                <p className="event-form__subtitle">Introduce la información del evento</p>
                <div className="event-form__grid">
                    <div className={fieldClass('nombre', true)}>
                        <label htmlFor="nombre">Nombre: </label>
                        <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            value={evento.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="nombre" />
                    </div>
                    <div className={fieldClass('descripcion', true)}>
                        <label htmlFor="descripcion">Descripcion: </label>
                        <input
                            id="descripcion"
                            type="text"
                            name="descripcion"
                            value={evento.descripcion}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </div>
                    <div className={fieldClass('fechaEvento')}>
                        <label htmlFor="fechaEvento">Fecha: </label>
                        <input
                            id="fechaEvento"
                            type="date"
                            name="fechaEvento"
                            value={evento.fechaEvento}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="fechaEvento" />
                    </div>
                    <div className={fieldClass('horaEvento')}>
                        <label htmlFor="horaEvento">Hora: </label>
                        <input
                            id="horaEvento"
                            type="time"
                            name="horaEvento"
                            value={evento.horaEvento}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="horaEvento" />
                    </div>
                    <div className={fieldClass('precioMinimo')}>
                        <label htmlFor="precioMinimo">Precio mínimo: </label>
                        <input
                            id="precioMinimo"
                            type="number"
                            name="precioMinimo"
                            min="0"
                            value={evento.precioMinimo}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="precioMinimo" />
                    </div>
                    <div className={fieldClass('precioMaximo')}>
                        <label htmlFor="precioMaximo">Precio máximo: </label>
                        <input
                            id="precioMaximo"
                            type="number"
                            name="precioMaximo"
                            min="0"
                            value={evento.precioMaximo}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="precioMaximo" />
                    </div>
                    <div className={fieldClass('localidad')}>
                        <label htmlFor="localidad">Localidad: </label>
                        <input
                            id="localidad"
                            type="text"
                            name="localidad"
                            value={evento.localidad}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="localidad" />
                    </div>
                    <div className={fieldClass('genero')}>
                        <label htmlFor="genero">Género: </label>
                        <input
                            id="genero"
                            type="text"
                            name="genero"
                            value={evento.genero}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </div>
                    <div className={fieldClass('nombreRecinto', true)}>
                        <label htmlFor="nombreRecinto">Nombre del recinto: </label>
                        <input
                            id="nombreRecinto"
                            type="text"
                            name="nombreRecinto"
                            value={evento.nombreRecinto}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                        <ValidatorAlert validators={validators} touched={touched} field="nombreRecinto" />
                    </div>
                    <div className={fieldClass('imagenUrl', true)}>
                        <label htmlFor="imagenUrl">URL de la imagen: </label>
                        <input
                            id="imagenUrl"
                            type="url"
                            name="imagenUrl"
                            value={evento.imagenUrl}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </div>
                </div>
                <div className="event-form__actions">
                    <button className="event-form__submit" type="submit" disabled={isFormInvalid}>
                        Registrar evento
                    </button>
                    {/*role="status" (polite live region), not "alert": success is not urgent*/}
                    {submitStatus === 'success' && !id && (
                        <div className="alert alert-success" role="status">
                            Evento creado correctamente.
                        </div>
                    )}
                    {submitStatus === 'success' && id && (
                        <div className="alert alert-success" role="status">
                            Evento actualizado correctamente.
                        </div>
                    )}
                    {submitStatus === 'error' && !id && (
                        <div className="alert alert-danger" role="alert">
                            No se pudo crear el evento. Inténtalo de nuevo.
                        </div>
                    )}
                    {submitStatus === 'error' && id && (
                        <div className="alert alert-danger" role="alert">
                            No se pudo actualizar el evento. Inténtalo de nuevo.
                        </div>
                    )}
                </div>
            </form>
            )}
        </>
    );
}
