import {formatName} from '../lib/format';
import {magnitude} from '../lib/magnitude';
export const Inspector = (star: {name:string;brightness:number}) => `${formatName(star.name)}: ${magnitude(star.brightness)}`;
