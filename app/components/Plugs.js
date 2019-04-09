import React, { Fragment } from 'react';
import Stars from './Stars';

const Link = ({ href, children }) => (
    <a href={href} className={'alert-link'} target='_blank'>
        { children }
    </a>
);

const Plugs = () => (
    <Fragment>
        <Stars />
    </Fragment>
);

export default Plugs;
