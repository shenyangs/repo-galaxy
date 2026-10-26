import {StarMap} from './components/StarMap';
import {Inspector} from './components/Inspector';
import {catalog} from './data/catalog';
export const App = () => ({map: StarMap(catalog), inspector: Inspector(catalog[0])});
