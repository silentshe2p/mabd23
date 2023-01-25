import * as jose from 'jose';

export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getApiUrl = () => process.env.API_URL;

export const fetchLocal = (returnVal = null, delay = 0, success = true) => {
  return promiseWrapper(
    new Promise((resolve, reject) => {
      setTimeout(() => {
        return success
          ? resolve(returnVal)
          : reject(new Error('Fetch local failed'));
      }, delay);
    })
  );
};

// Promise wrapper to comply with React Suspense API
export const promiseWrapper = (promise) => {
  let response,
    status = 'pending';

  const suspender = promise.then(
    (res) => {
      status = 'success';
      response = res;
    },
    (err) => {
      status = 'error';
      response = err;
    }
  );

  const read = (msg = null) => {
    if (msg) console.log(msg);
    switch (status) {
      case 'pending':
        throw suspender;
      case 'error':
        throw response;
      default:
        return response;
    }
  };

  return { read };
};

// Fetch API response handler for HTTP errors
export const responseHandler = async (response) => {
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }
  if (!response.ok) {
    const err = new Error(
      (data && data.message) || `HTTP erred with code ${response.status}`
    );
    err.status = response.status;
    throw err;
  }
  return data;
};

export const getLSToken = () => localStorage.getItem(process.env.TOKEN_LSKEY);
export const setLSToken = (token) =>
  localStorage.setItem(process.env.TOKEN_LSKEY, token);
export const removeLSToken = () =>
  localStorage.removeItem(process.env.TOKEN_LSKEY);

export const decodeJwToken = (token) => {
  try {
    const claims = jose.decodeJwt(token);
    return claims;
  } catch (err) {
    throw err;
  }
};

export const genJwToken = async (payload, expiresIn = '72H') => {
  const alg = 'RS256';
  const kid = process.env.KID;
  const pkcs8 = process.env.PRIVATE_KEY;

  try {
    const privateKey = await jose.importPKCS8(pkcs8, alg);
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg, kid })
      .setIssuedAt()
      .setIssuer(process.env.ISSUER)
      .setAudience(process.env.AUDIENCE)
      .setExpirationTime(expiresIn)
      .sign(privateKey);
    return token;
  } catch (err) {
    throw err;
  }
};

export const verifyJwToken = async (token) => {
  const alg = 'RS256';
  const spki = process.env.PUBLIC_KEY;
  const audience = process.env.AUDIENCE;
  const issuer = process.env.ISSUER;

  try {
    const publicKey = await jose.importSPKI(spki, alg);
    const { payload } = await jose.jwtVerify(token, publicKey, {
      audience,
      issuer,
    });
    return payload;
  } catch (err) {
    throw err;
  }
};

export const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
