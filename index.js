import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

const getDisplayName = Component => (
  Component.displayName || Component.name || 'Component'
);

const isObject = item => typeof item === 'object' && item !== null && !Array.isArray(item);

// creates a new actions list with initial context argument set
export const bindActions = (accum, actions = {}, context) => {

  Object.keys(actions).forEach((key) => {
    const value = actions[key];

    if (isObject(value)) {
      // go deeper if actions[key] is Object
      accum[key] = bindActions({}, value, context);
    } else if (typeof value === 'function') {
      // can set value of the result
      accum[key] = value.bind(null, context);
    }
  });

  return accum;
};

export const injectDeps = (context, _actions) => {
  const actions = bindActions({}, _actions, context);

  return (Component) => {
    const ComponentWithDeps = React.createClass({
      childContextTypes: {
        context: React.PropTypes.object,
        actions: React.PropTypes.object
      },

      getChildContext() {
        return {
          context,
          actions
        };
      },

      render() {
        return (<Component {...this.props} />);
      }
    });

    ComponentWithDeps.displayName = `InjectDeps(${getDisplayName(Component)})`;
    return hoistStatics(ComponentWithDeps, Component);
  };
}

const defaultMapper = (context, actions) => ({
  context,
  actions,
});

export const useDeps = (mapper = defaultMapper) => {
  return (Component) => {
    const ComponentUseDeps = React.createClass({
      render() {
        const {context, actions} = this.context;
        const mappedProps = mapper(context, actions);

        const newProps = {
          ...this.props,
          ...mappedProps
        };

        return (<Component {...newProps} />);
      },

      contextTypes: {
        context: React.PropTypes.object,
        actions: React.PropTypes.object
      }
    });

    ComponentUseDeps.displayName = `UseDeps(${getDisplayName(Component)})`;
    return hoistStatics(ComponentUseDeps, Component);
  };
}