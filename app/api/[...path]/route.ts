import {env} from 'cloudflare:workers';
import {createGateway} from '../../../lib/gateway';
export const dynamic='force-dynamic';
const gateway=createGateway(env);
export const GET=gateway.GET;export const POST=gateway.POST;export const PATCH=gateway.PATCH;export const DELETE=gateway.DELETE;
