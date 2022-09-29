/**
 * @jest-environment node
 */
import { INTEREST_ARRAY_MAX_LENGTH, PushNotifications } from '../src';
import fetchMock from 'jest-fetch-mock';
const rand = () =>
  Math.random()
    .toString(16)
    .slice(2);

describe('publishToInterests', () => {
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
    const interests = ['donuts'];
    await pn.publishToInterests(interests, body);

    expect(fetchMock.mock.calls.length).toEqual(1);

    expect(fetchMock.mock.calls[0][0]).toEqual(
      `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes/interests`
    );
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      body: JSON.stringify({ ...body, interests }),
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer SECRET_KEY',
        'Content-Type': 'application/json',
        'X-Pusher-Library': 'pusher-beams-fetch 1.0.0',
      },
    });
  });

  it('should fail if no interests nor publishRequest are passed', () => {
    //@ts-expect-error
    return expect(pn.publishToInterests()).rejects.toThrowError(
      'interests argument is required'
    );
  });

  it('should fail if interests parameter passed is not an array', () => {
    //@ts-expect-error

    return expect(pn.publishToInterests('donuts')).rejects.toThrowError(
      'interests argument is must be an array'
    );
  });

  it('should fail if no publishRequest is passed', () => {
    //@ts-expect-error
    return expect(pn.publishToInterests(['donuts'])).rejects.toThrowError(
      'publishRequest argument is required'
    );
  });

  it('should fail if no interests are passed', () => {
    //@ts-ignore
    return expect(pn.publishToInterests([], {})).rejects.toThrowError(
      'Publish requests must target at least one interest to be delivered'
    );
  });

  it('should fail if too many interests are passed', () => {
    let interests: string[] = [];
    for (let i = 0; i < INTEREST_ARRAY_MAX_LENGTH + 1; i++) {
      interests.push(rand());
    }

    //@ts-ignore
    return expect(pn.publishToInterests(interests, {})).rejects.toThrowError(
      `Number of interests (${INTEREST_ARRAY_MAX_LENGTH +
        1}) exceeds maximum of ${INTEREST_ARRAY_MAX_LENGTH}`
    );
  });

  it('should fail if an interest is not a string', () => {
    return expect(
      //@ts-ignore
      pn.publishToInterests(['good_interest', false], {})
    ).rejects.toThrowError('interest false is not a string');
  });

  it('should fail if an interest is too long', () => {
    return expect(
      //@ts-ignore
      pn.publishToInterests(['good_interest', 'a'.repeat(165)], {})
    ).rejects.toThrowError(/is longer than the maximum of 164 characters/);
  });

  it('should fail if an interest contains invalid characters', () => {
    return (
      pn
        //@ts-ignore
        .publishToInterests(['good-interest', 'bad|interest'], {})
        .catch(error => {
          expect(error.message).toMatch(/contains a forbidden character/);
          //@ts-ignore
          return pn.publishToInterests(['good-interest', 'bad:interest'], {});
        })
        .catch(error => {
          expect(error.message).toMatch(/contains a forbidden character/);
        })
    );
  });
});
