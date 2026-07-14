const URL = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';

export const getEventos = async () =>{
    const response = await fetch(URL);
    if (!response.ok) {
        throw new Error(`Error ${response.status}`);
    }
    return await response.json();
}

export const getEventoById = async (id) =>{
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
        throw new Error(`Error ${response.status}`);
    }
    return await response.json();
}

