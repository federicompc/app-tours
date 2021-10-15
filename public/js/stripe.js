/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// import Stripe from 'stripe';

export const bookTour = async (tourId) => {
  try {
    var currentLocation = window.location;
    console.log(currentLocation.host);
    // var stripe = await Stripe(
    //   'pk_test_51JkFecHwk2MeuXoWHUGt2hmpAt1XOPpEPVWqdo9ABOlh50vMeFDORjB0QGLCTkEUsPQP1o0taTl5QBfYrYDX2Kby00z06isuy4'
    // );
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session.data.session.url);
    window.location.replace(session.data.session.url);

    // 2) Create checkout form + chanre credit card
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
