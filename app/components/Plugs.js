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

        <br />

        <div className={'alert alert-primary'}>
            <p>More From Me...</p>
            • <Link href='https://github.com/relax-js/relax'>Relax - A Redux Alternative</Link> - <small>No more action types, switch statements, middleware, and especially no reducers!</small>
        </div>
    </Fragment>
);

export default Plugs;
