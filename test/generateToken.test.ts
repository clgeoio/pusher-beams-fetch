/**
 * @jest-environment node
 */
import { PushNotifications, USERS_STRING_MAX_LENGTH } from '../src';
import { decodeJwt, decodeProtectedHeader } from 'jose';

describe('generateToken', () => {
  let pn: PushNotifications;
  const instanceId = '12345';

  beforeEach(() => {
    pn = new PushNotifications({
      instanceId,
      secretKey: '1234',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fail if no user id is provided', () => {
    // @ts-ignore
    expect(() => pn.generateToken()).rejects.toThrow(
      'userId argument is required'
    );
  });

  it('should fail if no user id is the empty string', () => {
    expect(() => pn.generateToken('')).rejects.toThrow(
      'userId cannot be the empty string'
    );
  });

  it('should fail if the user id exceeds the permitted max length', () => {
    expect(() => pn.generateToken('a'.repeat(165))).rejects.toThrow(
      `userId is longer than the maximum length of ${USERS_STRING_MAX_LENGTH}`
    );
  });

  it('should fail if the user if is not a string', () => {
    const userId = false;
    expect(() =>
      // @ts-ignore
      pn.generateToken(userId).rejects.toThrow('userId must be a string')
    );
  });

  it('should return a valid JWT token if everything is correct', async () => {
    const userId = 'hermione.granger@hogwarts.ac.uk';
    // const options = {
    //   expiresIn: '24h',
    //   issuer: `https://${pn.instanceId}.pushnotifications.pusher.com`,
    //   subject: userId,
    // };
    // const expected = {
    //   token:
    //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjQ0MzExMzAsImV4cCI6MTY2NDUxNzUzMCwiaXNzIjoiaHR0cHM6Ly8xMjM0NS5wdXNobm90aWZpY2F0aW9ucy5wdXNoZXIuY29tIiwic3ViIjoiaGVybWlvbmUuZ3JhbmdlckBob2d3YXJ0cy5hYy51ayJ9.bq3_XWgnh1k0qnGDqOSJx5tgBYU1OAF90yL8RbLQsHc',
    // };
    const { token } = await pn.generateToken(userId);

    expect(decodeJwt(token)).toEqual({
      iss: `https://${instanceId}.pushnotifications.pusher.com`,
      sub: userId,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });

    expect(decodeProtectedHeader(token)).toEqual({
      alg: 'HS256',
      typ: 'JWT',
    });
  });
});
