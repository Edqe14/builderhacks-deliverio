import { APIAuthentication, Hop } from '@onehop/js';
import axios from 'axios';

const hop = new Hop(process.env.HOP_TOKEN as APIAuthentication);
export const hopRaw = axios.create({
  baseURL: 'https://api.hop.io/v1',
  headers: {
    Authorization: process.env.HOP_TOKEN as string,
  }
});

export const deleteChannel = (id: string) => axios.delete(`/channels/${id}`);

export default hop;