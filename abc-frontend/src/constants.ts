export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
// REACT_APP_BACKEND_PORT is filled from the dev shell script
export const API_URL = process.env.NODE_ENV == 'development' ? `${process.env.REACT_APP_HOSTNAME ?? 'http://127.0.0.1'}:${process.env.REACT_APP_BACKEND_PORT ?? 8000}` : ""; // rerouted through nginx to hit django if omitted
