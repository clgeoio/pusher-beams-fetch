# Pusher Beams w/ Fetch and JOSE Server SDK

This package is an implementation of the [Pusher Beams Node Server SDK](https://www.npmjs.com/package/@pusher/push-notifications-server) suitable for use in environments like Cloudflare Workers that have the Web Fetch API, but no access to node utilities.

I've ported this code over from the 1.2.4 SDK at time of writing and will do my best to update where required.
In terms of compatability, I've implemented most of the tests at [in the Node Server repo](https://github.com/pusher/push-notifications-node/tree/master/__tests__) and have them passing - although most of the tests are for ensuring the correct params are passed through.

## Usage

```
import { PushNotifications } from 'pusher-beams-fetch';

const pn = new PushNotifications({
  instanceId: 'some value',
  secretKey: 'something else'
});

const generatedToken = await pn.generateToken('foo@bar.com');
// return a JSON response with the generatedToken using your framework of choice.
// generatedToken is an object with a property token: string

return new Response(JSON.stringify(generatedToken), {
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  }
});
```

## Reference

### `constructor PushNotifications`

`new PushNotifications(options)`

Construct a new Pusher Beams Client connected to your Beams instance.

You only need to do this once.

#### Arguments

{% parameter 'options', 'Object', true %}

- `instanceId` (String | _Required_) - The unique identifier for your Beams instance. This can be found in the dashboard under "Credentials".
- `secretKey` (String | _Required_) - The secret key your server will use to access your Beams instance. This can be found in the dashboard under "Credentials".

{% endparameter %}

#### Returns

A Pusher Beams client

#### Example

```typescript
import { PushNotifications } from 'pusher-beams-fetch';

const pn = new PushNotifications({
  instanceId: 'some value',
  secretKey: 'something else',
});
```

### `.publishToInterests`

Publish a push notification to devices subscribed to given Interests, with the given payload.

#### Arguments

{% parameter 'interests', 'Array&lt;String&gt;', true %}

Interests to send the push notification to, ranging from 1 to 100 per publish request. See [Concept: Device Interests](https://pusher.com/docs/beams/concepts/device-interests).

{% endparameter %}
{% parameter 'publishBody', 'Object' %}

See [publish API reference](https://pusher.com/docs/beams/reference/publish-api#request-body).

{% endparameter %}

#### Returns

(Promise) - A promise that resolves to a `publishResponse`. See [publish API reference](https://pusher.com/docs/beams/reference/publish-api#success-response-body).

#### Example

```typescript
await pn.publishToInterests(['hello'], {
  apns: {
    aps: {
      alert: {
        title: 'Hello',
        body: 'Hello, world!',
      },
    },
  },
  fcm: {
    notification: {
      title: 'Hello',
      body: 'Hello, world!',
    },
  },
  web: {
    notification: {
      title: 'Hello',
      body: 'Hello, world!',
    },
  },
});
```

### `.publishToUsers`

Publish a push notification to devices belonging to specific users, with the given payload.

#### Arguments

{% parameter 'userIDs', 'Array&lt;String&gt;', true %}

User IDs to send the push notification to, ranging from 1 to 1000 per publish request. See [Concept: Authenticated Users](https://pusher.com/docs/beams/concepts/authenticated-users).

{% endparameter %}
{% parameter 'publishBody', 'Object' %}

See [publish API reference](https://pusher.com/docs/beams/reference/publish-api#request-body).

{% endparameter %}

#### Returns

(Promise) - A promise that resolves to a `publishResponse`. See [publish API reference](https://pusher.com/docs/beams/reference/publish-api#success-response-body).

#### Example

```typescript
await pn.publishToUsers(['user-001', 'user-002'], {
  apns: {
    aps: {
      alert: {
        title: 'Hello',
        body: 'Hello, world!',
      },
    },
  },
  fcm: {
    notification: {
      title: 'Hello',
      body: 'Hello, world!',
    },
  },
  web: {
    notification: {
      title: 'Hello',
      body: 'Hello, world!',
    },
  },
});
```

### `.generateToken`

Generate a Beams auth token to allow a user to associate their device with their user id. The token is valid for 24 hours.

#### Arguments

{% parameter 'userID', 'String', true %}

User ID of the user for whom you want to generate a Beams token.

{% endparameter %}

#### Returns

A Beams token for the given user.

#### Example

```typescript
const beamsToken = await pn.generateToken('user-001');
```

### `.deleteUser`

Delete a user and all their devices from Pusher Beams.

#### Arguments

{% parameter 'userID', 'String', true %}

The user ID of the user you wish to delete.

{% endparameter %}

#### Returns

(Promise) - A promise that resolves with no arguments. If deletion fails, the promise will reject.

#### Example

```typescript
await pn.deleteUser('user-001');
```
