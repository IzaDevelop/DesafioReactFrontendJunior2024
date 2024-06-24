import axios from "axios";
import apiUrl from "./apiUrl";

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
})

export default api