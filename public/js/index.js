import '@babel/polyfill';
/*eslint-disable*/
import { login } from './../js/login';
import { displayMap } from './../js/mapbox';
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
displayMap(locations);
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('datos', email, password);
  login(email, password);
});
