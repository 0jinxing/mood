import { createElement } from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import 'antd/dist/antd.css';
import './global.scss';

ReactDOM.render(createElement(App), document.querySelector('#root'));
