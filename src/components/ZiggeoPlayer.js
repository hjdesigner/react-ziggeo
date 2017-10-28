import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    ziggeoPlayerAttributesPropTypes, ziggeoPlayerEmbeddingEventsPropTypes,
    ziggeoPlayerConvertedAttributes
} from "../constants";

class ZiggeoPlayer extends Component {

    static propTypes = {
        apiKey: PropTypes.string.isRequired,
        ...ziggeoPlayerConvertedAttributes,
        ...ziggeoPlayerEmbeddingEventsPropTypes
    };

    static defaultProps = {
        "ziggeo-theme": 'default',
        "ziggeo-themecolor": 'default',
        ...Object.keys(ziggeoPlayerEmbeddingEventsPropTypes).reduce((defaults, event) => {
            defaults[event] = () => {};
            return defaults;
        }, {})
    };

    componentWillMount () {
        this.application  = ZiggeoApi.V2.Application.instanceByToken(this.props.apiKey);
    }

    componentDidMount () {
        // return undefined, find element based on DOM
        //_self.embedding =  ZiggeoApi.V2.Player.findByElement( ReactDOM.findDOMNode(this) );

        this.application.on("ready", function () {
            Object.entries(this._ziggeoEvents).forEach(([event, func]) => {
                this.application.embed_events.on(event, func);
            });

        }, this);
    };

    componentWillUnmount () { this.application.destroy(); }

    render () {
        return (
            <ziggeoplayer ref={this._addZiggeoAttributes} ></ziggeoplayer>
        );
    };

    _ziggeoEvents = Object.keys(ziggeoPlayerEmbeddingEventsPropTypes).reduce((memo, propName) => {
        const eventName = propName.replace(/([A-Z])/g, '_$1').toLowerCase().slice(3)
                                    .replace(/(recorder_|player_)/g, '');
        memo[eventName] = (...args) => {
            this.props[propName](...args)
        };
        return memo;
    }, {});

    _addZiggeoAttributes = (node) => {

        // Inject node with provided ziggeo options
        if (node) {
            const regexp = new RegExp(/(ziggeo-)/g);
            Object.keys(this.props)
                .filter(value => regexp.test(value)).reduce((props, value) => {
                    // Check if prop type existing
                    if (!ziggeoPlayerConvertedAttributes[value]) {
                        console.warn('Please be sure there\'re no typo in ' + value + ' option');
                    }
                    node.setAttribute(value, this.props[value])
            }, {});
        }
    };
}

export default ZiggeoPlayer;
