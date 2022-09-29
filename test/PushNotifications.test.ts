/**
 * @jest-environment node
 */
import { PushNotifications } from '../src';

describe('PushNotifications Constructor', () => {
  it('should accept valid parameters', () => {
    new PushNotifications({
      instanceId: '12345',
      secretKey: '12345',
    });
  });

  it('should fail if no options passed', () => {
    // @ts-expect-error
    expect(() => new PushNotifications()).toThrow(
      'PushNotifications options object is required'
    );
    // @ts-ignore
    expect(() => new PushNotifications(null)).toThrow(
      'PushNotifications options object is required'
    );
  });

  it('should fail if no instanceId passed', () => {
    // @ts-ignore
    expect(() => new PushNotifications({ secretKey: '1234' })).toThrow(
      '"instanceId" is required in PushNotifications options'
    );
  });

  it('should fail if no secretKey passed', () => {
    // @ts-ignore
    expect(() => new PushNotifications({ instanceId: '1234' })).toThrow(
      '"secretKey" is required in PushNotifications options'
    );
  });

  it('should fail if instanceId is not a string', () => {
    expect(
      // @ts-ignore
      () => new PushNotifications({ instanceId: false, secretKey: '1234' })
    ).toThrow();
  });

  it('should fail if secretKey is not a string', () => {
    expect(
      // @ts-ignore
      () => new PushNotifications({ instanceId: '1234', secretKey: false })
    ).toThrow();
  });

  it('should fail if endpoint is not a string', () => {
    expect(
      () =>
        new PushNotifications({
          instanceId: '1234',
          secretKey: '1234',
          // @ts-ignore
          endpoint: false,
        })
    ).toThrow();
  });

  it('should set endpoint to the correct default', () => {
    const pn = new PushNotifications({
      instanceId: 'INSTANCE_ID',
      secretKey: 'SECRET_KEY',
    });
    // @ts-expect-error
    expect(pn.endpoint).toEqual(
      'https://INSTANCE_ID.pushnotifications.pusher.com'
    );
  });
});
