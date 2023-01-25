import {
  authHeader,
  getApiUrl,
  getLSToken,
  setLSToken,
  decodeJwToken,
  genJwToken,
  verifyJwToken,
  promiseWrapper,
  responseHandler,
} from './utils';
// import { mockAuth, mockData, mockIntro } from './mocks';

const apiUrl = getApiUrl();

// Verify validity of stored jwt token and refresh it if neccessary
export const authUser = () => {
  const authedUserPromise = new Promise((resolve, reject) => {
    (async () => {
      try {
        const token = getLSToken();
        if (!token) return resolve(null); // no token stored so no user logged in
        const { user } = await verifyJwToken(token);
        return resolve(user);
      } catch (err) {
        if (err.code === 'ERR_JWT_EXPIRED') {
          // Need to refresh expired token
          try {
            const { user } = decodeJwToken(getLSToken());
            await signInUser(user);
            return resolve(user);
          } catch (err) {
            console.log(`Failed to refresh token ${err.message}`); // TODO: error reporting
            return reject(err);
          }
        } else {
          console.log(`Failed to decode token (${err.message})`); // TODO: error reporting
          return resolve(null);
        }
      }
    })();
  });
  return promiseWrapper(authedUserPromise);
};

export const signInUser = async (user) => {
  try {
    const res = await fetch(apiUrl + 'api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    });
    await responseHandler(res);
    // await mockAuth(user);
    const token = await genJwToken({ user });
    setLSToken(token);
  } catch (err) {
    // TODO: err reporting
    console.log(`Failed to login: ${err.message}`);
    throw err;
  }
};

const fetchData = (url, transformer = null, options = {}) =>
  promiseWrapper(
    fetch(url, {
      headers: authHeader(getLSToken()),
      ...options,
    })
      .then(async (res) => {
        const data = await responseHandler(res);
        return transformer ? transformer(data) : data;
      })
      .catch((err) => {
        // TODO: error reporting
        console.log(`Failed to fetch: ${err.message}`);
        throw err;
      })
  );

const parseJSON = (data) => JSON.parse(data);

// export const fetchAvatar = (delay = 1000) => mockData('avatar', delay);
// export const fetchIntro = (delay = 1000) => mockIntro(delay);
// export const fetchPuzzle = (delay = 2000) =>
//   mockData('puzzle', delay, (d) => JSON.parse(d));
// export const fetchBdmsg = (delay = 1000) => mockData('bdmsg', delay);
// export const fetchMedia = (path, delay = 3000) => mockData(path, delay);

export const fetchAvatar = () => fetchData(apiUrl + 'media/act-avatar.jpg');
export const fetchIntro = () => ({
  matAvatar: fetchData(apiUrl + 'media/cvs/mat-avatar.jpg'),
  oakAvatar: fetchData(apiUrl + 'media/cvs/oak-avatar.jpg'),
  intro: fetchData(apiUrl + 'api/intro/2023', parseJSON),
});
export const fetchPuzzle = () =>
  fetchData(apiUrl + 'api/puzzle/2023', parseJSON);
export const fetchBdmsg = () => fetchData(apiUrl + 'api/bdmsg/2023');
export const fetchMedia = (path) => fetchData(apiUrl + 'media/' + path);
export const postCompletion = async (user) => {
  const stamp = `${user}-${Date.now()}`;
  const update = {
    Key: {
      type: { S: 'completion' },
      year: { N: '2023' },
    },
    UpdateExpression: 'SET #data = list_append(#data, :stamp)',
    ExpressionAttributeNames: {
      '#data': 'data',
    },
    ExpressionAttributeValues: {
      ':stamp': { L: [{ S: `${stamp}` }] },
    },
  };
  try {
    const res = await fetch(apiUrl + 'api', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(getLSToken()),
      },
      body: JSON.stringify({ update }),
    });
    await responseHandler(res);
  } catch (err) {
    console.log(`Failed to post completion: ${err.message}`);
  }
};
