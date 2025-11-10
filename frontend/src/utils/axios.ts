import axios from "axios";

const api = axios.create({
    baseURL : "https://link-up-node.vercel.app" ,
    withCredentials : true
})

export default api