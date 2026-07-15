import {toEvento} from '../models/eventModel'

const API_URL = 'http://teacherbanking.us-east-1.elasticbeanstalk.com/eventos';

//All CRUD calls will need to handle the possible response errors in the same way
async function handleResponse(response) {
  if (!response.ok) throw new Error(`Error ${response.status}`);
  
  // http 204 === response is OK but the body is empty
  return response.status === 204 ? undefined : response.json();
}

export const createEvent = async (event) =>{
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    });
    return toEvento(await handleResponse(response));
}

export const getEvents = async () =>{
    const response = await fetch(API_URL);
    return (await handleResponse(response) ?? []).map(toEvento);
}

export const getEventById = async (id) =>{
    const response = await fetch(`${API_URL}/${id}`);
    return toEvento(await handleResponse(response));
}
