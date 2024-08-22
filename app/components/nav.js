import React from 'react';
import styles from './nav.css';

const Nav = (props) => {
    const dots = [];
    for (let i = 1; i <= props.totalSteps; i += 1) {
        const isActive = props.currentStep === i;
        dots.push((
            <span
                key={`step-${i}`}
                className={`${styles.dot} ${isActive ? styles.active : ''}`}
                onClick={() => props.goToStep(i)}
            >&bull;</span>
        ));
    }

    return (
        <div className={styles['wizard-nav']}>{dots}</div>
    );
};

export default Nav;
