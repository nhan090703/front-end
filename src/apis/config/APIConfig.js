// Người tạo: NPTN
// Ngày tạo: 28/05/2026

import axios from 'axios';

const baseURL = "https://localhost:7147/api"; 

let api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;