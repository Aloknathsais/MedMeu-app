import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Drop-in replacement for <Route> on any page that requires login.
 * Reads isAuthenticated from AppContext (not authService directly) so
 * it reacts immediately when SET_AUTH is dispatched — no page reload
 * needed after login/logout.
 *
 * Usage — same place you'd normally put a <Route>:
 *   <ProtectedRoute exact path="/profile/address-book" component={AddressBookPage} />
 */
const ProtectedRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
  const { state } = useApp();
  if (!Component) return null;

  return (
    <Route
      {...rest}
      render={(props) =>
        state.isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default ProtectedRoute;