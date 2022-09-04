import { Hop } from '@onehop/js';
import axios from 'axios';

const hop = new Hop('ptk_c19iYjUxZGIzNDVjZTM4NzNmNDM2NDJiZjI1OWE4MDM4OF81MDQ1NjYyOTA4MjQ3NjY0Mw');
export const hopRaw = axios.create({
  baseURL: 'https://api.hop.io/v1',
  headers: {
    Authorization: 'ptk_c19iYjUxZGIzNDVjZTM4NzNmNDM2NDJiZjI1OWE4MDM4OF81MDQ1NjYyOTA4MjQ3NjY0Mw',
  }
});

export default hop;