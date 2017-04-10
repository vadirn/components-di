import { injectDeps, useDeps } from '../index';

import React from 'react';
import renderer from 'react-test-renderer';

describe('Dependency injection', () => {
  it('should inject context and allow its usage', () => {
    const context = { foo: 'bar' };
    const Component1 = props => props.children;
    const InjectDepsComponent1 = injectDeps(context)(Component1);

    const Component2 = ({ foo }) => <div>{foo}</div>;
    const mapper = context => ({ foo: context.foo });
    const UseDepsComponent2 = useDeps(mapper)(Component2);

    const tree = renderer
      .create(
        <InjectDepsComponent1>
          <UseDepsComponent2 />
        </InjectDepsComponent1>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should inject actions list and allow its usage', () => {
    const context = { foo: 'bar' };
    const actions = { getFoo: (context, arg1) => `${context.foo} ${arg1}` };
    const Component1 = props => props.children;
    const InjectDepsComponent1 = injectDeps(context, actions)(Component1);

    const Component2 = ({ getFoo }) => <div>{getFoo('foo')}</div>;
    const mapper = (context, actions) => ({ getFoo: actions.getFoo });
    const UseDepsComponent2 = useDeps(mapper)(Component2);

    const tree = renderer
      .create(
        <InjectDepsComponent1>
          <UseDepsComponent2 />
        </InjectDepsComponent1>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should keep actions list structure', () => {
    const context = { foo: 'bar' };
    const actions = { one: { two: { three: { getFoo: (context, arg1) => `${context.foo} ${arg1}` } } } };
    const Component1 = props => props.children;
    const InjectDepsComponent1 = injectDeps(context, actions)(Component1);

    const Component2 = ({ getFoo }) => <div>{getFoo('foo')}</div>;
    const mapper = (context, actions) => ({ getFoo: actions.one.two.three.getFoo });
    const UseDepsComponent2 = useDeps(mapper)(Component2);

    const tree = renderer
      .create(
        <InjectDepsComponent1>
          <UseDepsComponent2 />
        </InjectDepsComponent1>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should allow multiple injections', () => {
    const context = { foo: 'bar' };
    const actions = { getFoo: (context, arg1) => `${context.foo} ${arg1}` };
    const Component1 = props => props.children;
    injectDeps(context, actions)(Component1);
    const InjectDepsComponent1 = injectDeps(context, actions)(Component1);

    const Component2 = ({ getFoo }) => <div>{getFoo('foo')}</div>;
    const mapper = (context, actions) => ({ getFoo: actions.getFoo });
    const UseDepsComponent2 = useDeps(mapper)(Component2);

    const tree = renderer
      .create(
        <InjectDepsComponent1>
          <UseDepsComponent2 />
        </InjectDepsComponent1>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should use default mapper if no mapper provided', () => {
    const context = { foo: 'bar' };
    const actions = { getFoo: (context, arg1) => `${context.foo} ${arg1}` };
    const Component1 = props => props.children;
    injectDeps(context, actions)(Component1);
    const InjectDepsComponent1 = injectDeps(context, actions)(Component1);

    const Component2 = ({ actions }) => <div>{actions.getFoo('foo')}</div>;
    const UseDepsComponent2 = useDeps()(Component2);

    const tree = renderer
      .create(
        <InjectDepsComponent1>
          <UseDepsComponent2 />
        </InjectDepsComponent1>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('should preserve original props', () => {
    const context = {};
    const Component1 = props => props.children;
    injectDeps(context)(Component1);
    const InjectDepsComponent1 = injectDeps(context)(Component1);

    const Component2 = ({ foo }) => <div>{foo}</div>;
    const UseDepsComponent2 = useDeps()(Component2);

    const tree = renderer
      .create(
        <InjectDepsComponent1>
          <UseDepsComponent2 foo="bar" />
        </InjectDepsComponent1>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Extra features of dependency injection', () => {
  it('should preserve static fields when injecting deps', () => {
    const Component1 = props => props.children;
    Component1.foo = 'bar';
    const InjectDepsComponent1 = injectDeps({})(Component1);
    expect(InjectDepsComponent1.foo).toBe('bar');
  });
  it('should preserve static fields when using deps', () => {
    const Component1 = props => props.children;
    Component1.foo = 'bar';
    const UseDepsComponent1 = useDeps()(Component1);
    expect(UseDepsComponent1.foo).toBe('bar');
  });
  it('should modify name when injecting deps', () => {
    const Component1 = props => props.children;
    Component1.displayName = 'Component1';
    const InjectDepsComponent1 = injectDeps({})(Component1);
    expect(InjectDepsComponent1.displayName).toBe('InjectDeps(Component1)');
  });
  it('should modify name when using deps', () => {
    const Component1 = props => props.children;
    Component1.displayName = 'Component1';
    const UseDepsComponent1 = useDeps()(Component1);
    expect(UseDepsComponent1.displayName).toBe('UseDeps(Component1)');
  });
});
