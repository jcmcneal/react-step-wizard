export const getHash = () => {
    return decodeURI(window.location.hash).replace(/^#/, '')
};

// export const onHashChange = () => {
//     this.setActiveStep(this.state.hashKeys[getHash()] || 0);
// };
