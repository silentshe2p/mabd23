import { promiseWrapper, wait } from './utils';

const mockAvatar = null;

const mockMatAvatar = null;

const mockOakAvatar = null;

const mockIntroContent = null;

const mockPuzzle = null;

const mockBdmsg = null;

const mockPuzzleMedia = {};

export const mockAuth = async (user) => {
  await wait(1000);
  if (user === 'admin') return 'Authorized user';
  throw new Error('Unknown user');
};

export const mockData = (
  dataType,
  delay = 1000,
  transformer = null,
  success = true
) => {
  let data = null;
  switch (dataType) {
    case 'intro':
      data = mockIntroContent;
      break;
    case 'matavatar':
      data = mockMatAvatar;
      break;
    case 'oakavatar':
      data = mockOakAvatar;
      break;
    case 'puzzle':
      data = mockPuzzle;
      break;
    case 'bdmsg':
      data = mockBdmsg;
      break;
    case 'avatar':
      data = mockAvatar;
      break;
    default:
      data = mockPuzzleMedia[dataType] ?? null;
      break;
  }

  return promiseWrapper(
    new Promise((resolve) => {
      setTimeout(resolve, delay);
    })
      .then(() => {
        if (success) {
          return transformer ? transformer(data) : data;
        } else {
          throw new Error('Mock failure');
        }
      })
      .catch((err) => {
        throw err;
      })
  );
};

export const mockIntro = (delay = 1000) => ({
  matAvatar: mockData('matavatar', delay),
  oakAvatar: mockData('oakavatar', delay),
  intro: mockData('intro', delay + 1000, (d) => JSON.parse(d)),
});
