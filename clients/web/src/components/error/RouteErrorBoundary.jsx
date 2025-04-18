import { useRouteError } from 'react-router-dom'

const RouteErrorBoundary = () => {
    const error = useRouteError();
    return (
      <div role="alert">
        <h1>Sorry, an unexpected error has occurred.</h1>
        <p>{error.statusText || error.message}</p>
      </div>
    );
};

export default RouteErrorBoundary