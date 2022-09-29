import { SignJWT } from 'jose';

const SDK_VERSION = '1.0.0';
export const INTERESTS_REGEX = new RegExp(
  '^(_|\\-|=|@|,|\\.|;|[A-Z]|[a-z]|[0-9])*$'
);
export const USERS_STRING_MAX_LENGTH = 164;
export const INTEREST_STRING_MAX_LENGTH = 164;
export const USERS_ARRAY_MAX_LENGTH = 1000;
export const INTEREST_ARRAY_MAX_LENGTH = 100;

class PushNotifications {
  private readonly instanceId: string;
  private readonly secretKey: string;
  private readonly endpoint: string;

  constructor(options: PushNotifications.Options) {
    if (options === null || typeof options !== 'object') {
      throw new Error('PushNotifications options object is required');
    }
    if (!options.hasOwnProperty('instanceId')) {
      throw new Error('"instanceId" is required in PushNotifications options');
    }
    if (typeof options.instanceId !== 'string') {
      throw new Error('"instanceId" must be a string');
    }
    if (!options.hasOwnProperty('secretKey')) {
      throw new Error('"secretKey" is required in PushNotifications options');
    }
    if (typeof options.secretKey !== 'string') {
      throw new Error('"secretKey" must be a string');
    }
    if (
      options.hasOwnProperty('endpoint') &&
      typeof options.endpoint !== 'string'
    ) {
      throw new Error('endpoint must be a string');
    }

    this.instanceId = options.instanceId;
    this.secretKey = options.secretKey;

    this.endpoint =
      options.endpoint ??
      `https://${this.instanceId}.pushnotifications.pusher.com`;
  }

  public async generateToken(userId: string) {
    if (userId === undefined || userId === null) {
      throw new Error('userId argument is required');
    }
    if (userId === '') {
      throw new Error('userId cannot be the empty string');
    }
    if (typeof userId !== 'string') {
      throw new Error('userId must be a string');
    }
    if (userId.length > USERS_STRING_MAX_LENGTH) {
      throw new Error(
        `userId is longer than the maximum length of ${USERS_STRING_MAX_LENGTH}`
      );
    }

    if (userId.length > USERS_STRING_MAX_LENGTH) {
      throw new Error(
        `userId is longer than the maximum length of ${USERS_STRING_MAX_LENGTH}`
      );
    }

    const encodedKey = new TextEncoder().encode(this.secretKey);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .setIssuer(`https://${this.instanceId}.pushnotifications.pusher.com`)
      .setSubject(userId)
      .sign(encodedKey);

    return {
      token: token,
    };
  }

  async publishToInterests(
    interests: string[],
    publishRequest: PushNotifications.PublishRequest
  ) {
    if (interests === undefined || interests === null) {
      throw new Error('interests argument is required');
    }
    if (!(interests instanceof Array)) {
      throw new Error('interests argument is must be an array');
    }
    if (interests.length < 1) {
      throw new Error(
        'Publish requests must target at least one interest to be delivered'
      );
    }
    if (interests.length > INTEREST_ARRAY_MAX_LENGTH) {
      throw new Error(
        `Number of interests (${interests.length}) exceeds maximum of ${INTEREST_ARRAY_MAX_LENGTH}.`
      );
    }
    if (publishRequest === undefined || publishRequest === null) {
      throw new Error('publishRequest argument is required');
    }

    for (const interest of interests) {
      if (typeof interest !== 'string') {
        throw new Error(`interest ${interest} is not a string`);
      }
      if (interest.length > INTEREST_STRING_MAX_LENGTH) {
        throw new Error(
          `interest ${interest} is longer than the maximum of ` +
            `${INTEREST_STRING_MAX_LENGTH} characters`
        );
      }
      if (!INTERESTS_REGEX.test(interest)) {
        throw new Error(
          `interest "${interest}" contains a forbidden character. ` +
            'Allowed characters are: ASCII upper/lower-case letters, ' +
            'numbers or one of _-=@,.;'
        );
      }
    }

    const body = Object.assign({}, publishRequest, { interests });

    return this._doRequest({
      path: `/publish_api/v1/instances/${this.instanceId}/publishes/interests`,
      method: 'POST',
      body,
    });
  }

  async publishToUsers(
    users: string[],
    publishRequest: PushNotifications.PublishRequest
  ) {
    if (users === undefined || users === null) {
      throw new Error('users argument is required');
    }
    if (!(users instanceof Array)) {
      throw new Error('users argument is must be an array');
    }
    if (users.length < 1) {
      throw new Error(
        'Publish requests must target at least one interest to be delivered'
      );
    }
    if (users.length > USERS_ARRAY_MAX_LENGTH) {
      throw new Error(
        `Number of users (${users.length}) exceeds maximum of ${USERS_ARRAY_MAX_LENGTH}.`
      );
    }
    if (publishRequest === undefined || publishRequest === null) {
      throw new Error('publishRequest argument is required');
    }
    for (const user of users) {
      if (typeof user !== 'string') {
        throw new Error(`user ${user} is not a string`);
      }
      if (user.length > INTEREST_STRING_MAX_LENGTH) {
        throw new Error(
          `user ${user} is longer than the maximum of ` +
            `${INTEREST_STRING_MAX_LENGTH} characters`
        );
      }
    }

    const body = Object.assign({}, publishRequest, { users });
    const options = {
      path: `/publish_api/v1/instances/${this.instanceId}/publishes/users`,
      method: 'POST',
      body,
    };

    return this._doRequest(options);
  }

  async deleteUser(userId: string) {
    if (userId === undefined || userId === null) {
      throw new Error('User ID argument is required');
    }
    if (typeof userId !== 'string') {
      throw new Error('User ID argument must be a string');
    }
    if (userId.length > USERS_STRING_MAX_LENGTH) {
      throw new Error('User ID argument is too long');
    }

    const options = {
      path: `/user_api/v1/instances/${
        this.instanceId
      }/users/${encodeURIComponent(userId)}`,
      method: 'DELETE',
    };
    return this._doRequest(options);
  }

  private async _doRequest(
    options: Omit<RequestInit, 'body'> & {
      path: string;
      body?: Record<string, any>;
    }
  ) {
    return fetch(`${this.endpoint}${options.path}`, {
      method: options.method,
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        'X-Pusher-Library': `pusher-beams-fetch ${SDK_VERSION}`,
      },
    }).then(async r => {
      if (r.status >= 200 && r.status < 300) {
        return r.json();
      }
      throw new Error(`Response was ${r.status}}`);
    });
  }
}

export { PushNotifications };
