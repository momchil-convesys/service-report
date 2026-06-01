import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  // This method determines if the route should be detached
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false; // Do not detach any routes
  }

  // This method stores the route handle (not used here)
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    // No need to store anything since we're not reusing
  }

  // This method determines if a stored route should be attached
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false; // Always return false to prevent attaching
  }

  // This method retrieves a stored route handle (not used here)
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null; // Always return null since we don't store handles
  }

  // This method determines if the route should be reused
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Return false if the route config is different, ensuring recreation
    return (
      future.routeConfig === curr.routeConfig && future.params['plantId'] === curr.params['plantId']
    );
  }
}
