import React from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import routes from '../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => matchPath(route.path, pathname))
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    let accumulatedPath = ''

    // Split the location and process each segment
    location.split('/').forEach((segment, index, array) => {
      if (segment) {
        accumulatedPath += `/${segment}` // Build the path incrementally

        // Find the closest route match
        const currentRoute = routes.find((route) =>
          matchPath({ path: route.path, exact: false }, accumulatedPath),
        )

        // If a route is found, add it to the breadcrumbs
        if (currentRoute) {
          breadcrumbs.push({
            pathname: accumulatedPath,
            name: currentRoute.name,
            active: index + 1 === array.length, // Mark the last segment as active
          })
        }
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <CBreadcrumbItem
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        )
      })}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
