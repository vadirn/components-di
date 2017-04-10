import PropTypes from 'prop-types';
import React from 'react';
import hoistStatics from 'hoist-non-react-statics';

const getDisplayName = Component => Component.displayName || Component.name || 'Component';

const isObject = item => typeof item === 'object' && item !== null && !Array.isArray(item);

// creates a new actions list with initial context argument set
export const bindActions = (accum, actions = {}, context) => {
  Object.keys(actions).forEach(key => {
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

export const injectDeps = (_context, _actions) => {
  const actions = bindActions({}, _actions, _context);

  return Component => {
    class ComponentWithDeps extends React.Component {
      getChildContext() {
        return {
          context: _context,
          actions,
        };
      }

      render() {
        return <Component {...this.props} />;
      }
    }

    ComponentWithDeps.childContextTypes = {
      context: PropTypes.object,
      actions: PropTypes.object,
    };

    ComponentWithDeps.displayName = `InjectDeps(${getDisplayName(Component)})`;
    return hoistStatics(ComponentWithDeps, Component);
  };
};

const defaultMapper = (context, actions) => ({
  context,
  actions,
});

export const useDeps = (mapper = defaultMapper) => {
  return Component => {
    const ComponentUseDeps = (props, context) => {
      const { context: _context, actions: _actions } = context;
      const mappedProps = mapper(_context, _actions);
      const newProps = { ...props, ...mappedProps };
      return <Component {...newProps} />;
    };

    ComponentUseDeps.contextTypes = {
      context: PropTypes.object,
      actions: PropTypes.object,
    };

    ComponentUseDeps.displayName = `UseDeps(${getDisplayName(Component)})`;
    return hoistStatics(ComponentUseDeps, Component);
  };
};
