/**
 * @jest-environment node
 */
import { PushNotifications, USERS_STRING_MAX_LENGTH } from '../src';
import fetchMock from 'jest-fetch-mock';

describe('deleteUser', () => {
  let pn: PushNotifications;

  beforeEach(() => {
    pn = new PushNotifications({
      instanceId: '1234',
      secretKey: '1234',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make the correct http request with valid params (with response body)', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ statusCode: 200 }));
    const userId = 'ron.weasley@hogwarts.ac.uk';
    return expect(pn.deleteUser(userId)).resolves.toEqual({ statusCode: 200 });
  });

  it('should fail if no user id is provided', () => {
    //@ts-expect-error
    expect(pn.deleteUser()).rejects.toThrowError(
      'User ID argument is required'
    );
  });

  it('should fail if the user id is too long', () => {
    const aVeryLongString = 'a'.repeat(USERS_STRING_MAX_LENGTH) + 'b';
    return expect(pn.deleteUser(aVeryLongString)).rejects.toThrowError(
      'User ID argument is too long'
    );
  });
});
