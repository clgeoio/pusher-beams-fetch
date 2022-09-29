/**
 * @jest-environment node
 */
import { PushNotifications, USERS_ARRAY_MAX_LENGTH } from '../src';
import fetchMock from 'jest-fetch-mock';
const rand = () =>
  Math.random()
    .toString(16)
    .slice(2);
describe('publishToUsers', () => {
  let pn: PushNotifications;
  const instanceId = '123456';

  beforeEach(() => {
    pn = new PushNotifications({
      instanceId,
      secretKey: 'SECRET_KEY',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make the correct http request with valid params', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ publishId: '123456' }));

    const body = {
      apns: {
        aps: {
          alert: 'Hi!',
        },
      },
    };
    const users = ['harry.potter@hogwarts.ac.uk'];
    await pn.publishToUsers(users, body);

    expect(fetchMock.mock.calls.length).toEqual(1);

    expect(fetchMock.mock.calls[0][0]).toEqual(
      `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes/users`
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      body: JSON.stringify({ ...body, users }),
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer SECRET_KEY',
        'Content-Type': 'application/json',
        'X-Pusher-Library': 'pusher-beams-fetch 1.0.0',
      },
    });
  });

  it('should fail if no users nor publishRequest are passed', () => {
    //@ts-ignore

    return expect(pn.publishToUsers()).rejects.toThrow(
      'users argument is required'
    );
  });

  it('should fail if users parameter passed is not an array', () => {
    return expect(
      //@ts-ignore
      pn.publishToUsers('harry.potter@hogwarts.ac.uk')
    ).rejects.toThrowError('users argument is must be an array');
  });

  it('should fail if no publishRequest is passed', () => {
    return expect(
      //@ts-ignore
      pn.publishToUsers(['harry.potter@hogwarts.ac.uk'])
    ).rejects.toThrowError('publishRequest argument is required');
  });

  it('should fail if too many users are passed', () => {
    let users: string[] = [];
    for (let i = 0; i < USERS_ARRAY_MAX_LENGTH + 1; i++) {
      users.push(rand());
    }
    //@ts-ignore
    return expect(pn.publishToUsers(users, {})).rejects.toThrow();
  });

  it('should fail if too few users are passed', () => {
    let users: string[] = [];
    //@ts-ignore
    return expect(pn.publishToUsers(users, {})).rejects.toThrow();
  });

  it('should fail if a user is not a string', () => {
    return expect(
      //@ts-ignore
      pn.publishToUsers(['good_user', false], {})
    ).rejects.toThrow();
  });
});
