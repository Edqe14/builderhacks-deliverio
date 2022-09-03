import { APIAuthentication, Hop } from '@onehop/js';

const hop = new Hop(process.env.HOP_TOKEN as APIAuthentication);

export default hop;