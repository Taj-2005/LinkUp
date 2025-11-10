import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
    baseURL : `${API_URL}/api` ,
    withCredentials : true
})

export default api