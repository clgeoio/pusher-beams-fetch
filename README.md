# Pusher Beams w/ Fetch and JOSE Server SDK

This package is an implementation of the [Pusher Beams Node Server SDK](https://www.npmjs.com/package/@pusher/push-notifications-server) suitable for use in environments like Cloudflare Workers that have the Web Fetch API, but no access to node utilities.

I've ported this code over from the 1.2.4 SDK at time of writing and will do my best to update where required.
In terms of compatability, I've implemented most of the tests at [in the Node Server repo](https://github.com/pusher/push-notifications-node/tree/master/__tests__) and have them passing - although most of the tests are for ensuring the correct params are passed through.

## Usage

```
const pn = new PushNotifications({
  instanceId: 'some value',
  secretKey: 'something else'
});


const { token } = await pn.generateToken('foo@bar.com');
```
