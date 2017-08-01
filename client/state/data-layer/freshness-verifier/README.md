# Data Layer freshness verifier

## Background

Calypso components are allowed to dispatch request actions that specify their data needs (most of the times using query components). Normally the components don't need a request to be issued they just need data that is "fresh".

When a component has a data need it dispatches a request action. This leaves a problem when the component is mounted, unmounted and mounted again 2 requests are executed even if the last one was executed seconds ago. This behavior could be observable in comments, if a user shows, hide, shows the comments of a post 2 requests are generated. This happens in other cases and there are unnecessary request being dispatched, possibly wasting data-usage, battery and CPU parsing the requests.

## Goals and characteristics

The goal of freshness verifier is to provide a way for data-layer users/handlers to specify that a given request should be ignored if an equal request was executed recently.
Data-layer should provide a default amount of time for the request be considered fresh, but there are situations where we require data to be more recent than in other uses of the same data, so the requester should also be able to configure the freshness value.

## API
The handler when using dispatchRequest needs to pass in the options object a freshness property, that represents the default maximum amount of time passed since last execution for the request be considered fresh (and ignored).
e.g:
```js
[ COMMENTS_REQUEST ]: [ dispatchRequest( fetchPostComments, addComments, announceFailure, noop, { freshness: 10000 } ) ],
```
The freshness value the data-layer sets acts as a default value if a data requester has a particular need for a different freshness value it can pass that value in the action being dispatched:
```js
{
 type: COMMENTS_REQUEST,
 siteId: 12886750,
 postId: 97,
 ...
 freshness: 2000
}
```
When a request is still fresh it does not trigger a network request and is ignored.

The freshness mechanism is optional and if no freshness is set in the handler or the action the freshness mechanism is not executed. If a freshness value is set on the handler but in a given component freshness should not be used it's possible to opt-out its usage by setting `freshness: 0` in the action being dispatched. Opt-out of the mechanism is not recommended unless in the presence of a specific case where fresh data is really needed.

The default value for the freshness of the actions of a given type is set in the handler so if the action does not set its own freshness value the one set in the handler of the request is used. There is no global default value if the both handler and action don't set a freshness value, freshness is not used.

In order to distinguish one request from another, the data-layer uses information of all the properties in the request action excluding meta and freshness properties. So if two request actions have all properties equal they are assumed to be the same request. If there is a difference in the properties, they are assumed to be different requests. Internally the data-layer converts the action to a key (string) and then uses that keys to compare requests. 

## A possible polling implementation

Polling is not recommended in calypso and should only be used in the presence of a very specific situation where other approaches are not possible. e.g. keeping data updated that comes from an external service we don't control and no other update mechanism is possible.
In the presence of such a special case freshness mechanism mixed with the [interval component](https://github.com/Automattic/wp-calypso/tree/master/client/lib/interval) allows a simple polling solution.

The polling solution consists in adding the interval component to the render function of the query component where we need periodic requests. The interval component is used to periodically dispatch an action request with the freshness needed. The freshness mechanism avoids the number of requests being multiplied by the number of query components on the page because duplicate requests are removed.
If there exists more than one polling component and one component is unmount the polling continues because the other component continues to issue requests.
It is possible to safely add a "polling" query component to the places that need that fresh data. When the data is not needed by any component the requests will stop being executed.