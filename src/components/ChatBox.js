import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Comment, Transition, Ref } from 'semantic-ui-react';
import { OAK_AVATAR_CACHE_KEY } from './IntroPlayer';
import { useCache } from '../lib/contexts';
import { useLocalStorage } from '../lib/hooks';

const TRANSITION_ANIMATION = 'slide down';
const TRANSITION_DURATION = 1700;

const OAK_GAMEOVER_CHATS = ['おやおや、ゲームオーバーか'];
const OAK_GAMEOVERAGAIN_CHATS = [
  'またゲームオーバー？',
  'ゲームオーバデジャブ？',
  'この短時間で何回ゲームオーバーになれば満足なのかな？',
];
const OAK_WRONGAGAIN_CHATS = [
  'ゲームオーバーになるとリトライができなくなるので、使いすぎないようにしましょう',
  'またかよ',
  'やっちゃったなぁ',
  'もっと集中すべし',
];

const pickOneRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const ChatBox = ({ chat, retries }) => {
  const { start, wrong } = chat;
  const [chatHistory, setChatHistory] = useState([]);
  const previousChat = useRef({});
  const previousRetries = useRef(retries);
  const [failedBefore, _, __] = useLocalStorage(process.env.REACT_APP_FAIL_LSKEY, false);

  const { getCache } = useCache();
  const oakAvatar = getCache(OAK_AVATAR_CACHE_KEY);

  const chatBoxRef = useRef(null);

  useLayoutEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chatHistory]);

  useEffect(() => {
    const { current: prevRetries } = previousRetries;
    const time = new Date(Date.now());
    const localeTime = time.toLocaleTimeString('jp-JP');

    if (JSON.stringify(chat) !== JSON.stringify(previousChat.current)) {
      // new quiz
      if (prevRetries < retries) {
        // game restarted
        setChatHistory([{ chat: '今度こそ！', time: localeTime }]);
      } else if (prevRetries === retries) {
        // answered correctly
        setChatHistory([
          ...chatHistory,
          {
            chat: start,
            time: localeTime,
          },
        ]);
      }
      previousChat.current = chat; // update chat
    } else {
      // same quiz
      if (prevRetries > retries && retries >= -1) {
        // answered incorrectly
        setChatHistory([
          ...chatHistory,
          {
            chat:
              retries < 0
                ? failedBefore
                  ? pickOneRandom(OAK_GAMEOVERAGAIN_CHATS)
                  : pickOneRandom(OAK_GAMEOVER_CHATS)
                : chatHistory[chatHistory.length - 1].chat === wrong ||
                  OAK_WRONGAGAIN_CHATS.includes(
                    chatHistory[chatHistory.length - 1].chat
                  )
                ? pickOneRandom(OAK_WRONGAGAIN_CHATS)
                : wrong,
            time: localeTime,
          },
        ]);
      }
    }
    if (previousRetries.current !== retries) {
      // update retries
      previousRetries.current = retries;
    }
  }, [chat, retries]);

  return (
    <Ref innerRef={chatBoxRef}>
    <Comment.Group minimal size="small" style={{ overflow: 'auto' }}>
      <Transition.Group
        animation={TRANSITION_ANIMATION}
        duration={TRANSITION_DURATION}
      >
        {chatHistory.map(({ chat, time }, idx) => (
          <Comment key={idx + '@' + time}>
            <Comment.Avatar src={oakAvatar} />
            <Comment.Content>
              <Comment.Author as="a">博士</Comment.Author>
              <Comment.Metadata>
                <span>{time}</span>
              </Comment.Metadata>
              <Comment.Text>{chat}</Comment.Text>
            </Comment.Content>
          </Comment>
        ))}
      </Transition.Group>
    </Comment.Group>
  </Ref>
  );
};
