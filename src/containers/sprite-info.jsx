import PropTypes from 'prop-types';
import React from 'react';

import SpriteInfoComponent from '../components/sprite-info/sprite-info.jsx';

// desktop: name and show/hide moved to the sprite tiles, so this only passes the props on
const SpriteInfo = props => <SpriteInfoComponent {...props} />;

SpriteInfo.propTypes = {
    ...SpriteInfoComponent.propTypes,
    onChangeDirection: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    x: PropTypes.number,
    y: PropTypes.number
};

export default SpriteInfo;
