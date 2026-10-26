import {project} from '../lib/coordinates';
import {magnitude} from '../lib/magnitude';
import {theme} from '../theme';
export const StarMap = (stars: {x:number;y:number;brightness:number}[]) => stars.map(star=>({...project(star),size:magnitude(star.brightness),color:theme.accent}));
