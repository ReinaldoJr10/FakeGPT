import axios, { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { CLIENT_ID, CLIENT_SECRET, getSessionData, logout } from './auth';

type LoginData = 
{
  username: String;
  password: String;
  }
type SignUpData = 
{
    email:string;
    username: string;
    password: string;
}

const BASE_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:8080';


/****************************************************************** 
Intercepta requisições axios, caso essa requisição tenha sucesso,
apenas retorna a resposta, caso fracasse com erro 401 (Unauthorized)
é feito o logout do usuário
******************************************************************/
axios.interceptors.response.use(
  (response) =>  response, 
  (error) =>
  {
    if (error.response.status === 401)
      logout();
    
    return Promise.reject(error);
  }
);

/****************************************************************** 
Realiza requisições axios sem cabeçalho configurado e com a URL base
já inserida
******************************************************************/
export const makeRequest = (params: AxiosRequestConfig) => 
{
  return axios({
    ...params,
    baseURL: BASE_URL
  });
}

/****************************************************************** 
Realiza requisições axios com cabeçalho de autorização "Bearer"
configurado e com a URL base já inserida
******************************************************************/
export const makePrivateRequest = (params: AxiosRequestConfig) => 
{
  const sessionData = getSessionData();

  const headers = {
    'Authorization': `Bearer ${sessionData.access_token}`
  }

  return makeRequest({ ...params, headers });

}

/****************************************************************** 
Realiza requisições axios para login, com cabeçalho de autorização 
"Basic" configurado, com a URL da requisição "/oauth/token" já inserida
e com método "POST"
******************************************************************/
export const makeLogin = (loginData: LoginData) => 
{
  const token = `${CLIENT_ID}:${CLIENT_SECRET}`;

  const headers = 
  {
    Authorization: `Basic ${window.btoa(token)}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const payload = qs.stringify({ ...loginData, grant_type: 'password' });

  return makeRequest({ url: '/oauth/token', data: payload, method: 'POST', headers });

}

export const makeSignUp = (signUpData: SignUpData) => {
  const payload = qs.stringify(signUpData);

  return makeRequest({
    url: '/signup',
    data: payload,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}