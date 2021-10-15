import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  //   console.log('data', data, 'type', type);
  const msgAlert = `${type} updated in successfully`;
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    // console.log(url);
    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    // console.log(res);
    if ((res.data.status = 'success')) {
      showAlert('success', msgAlert);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
