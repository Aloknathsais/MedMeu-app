import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
  const { state } = useApp();
  if (!Component) return null;

  return (
    <Route
      {...rest}
      render={(props) => {
        // The token is the source of truth; state alone can be stale.
        const hasToken = !!localStorage.getItem('medmeu_token');

        return state.isAuthenticated && hasToken ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        );
      }}
    />
  );
};

export default ProtectedRoute;