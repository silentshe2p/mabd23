import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, Suspense } from 'react';
import {
  Button,
  Container,
  Dimmer,
  Divider,
  Grid,
  Header,
  Loader,
  Ref
} from 'semantic-ui-react';
import { AnswerHighlight } from './AnswerHighlight';
import { ChatBox } from './ChatBox';
import { GameStatus } from './GameStatus';
import { QuizBoxSpWrapper } from './QuizBox';
import { fetchBdmsg, fetchMedia } from '../lib/api';
import { fetchLocal } from '../lib/utils';
import { useLocalStorage } from '../lib/hooks';

export const QUIZ_ID = 'qid';
export const QUIZ_TYPE = 'qtype';
export const QUIZ_TYPE_RULE = 'RULE';
export const QUIZ_TYPE_MSG = 'MSG';
export const QUIZ_TYPE_HIRA = 'HIRA';
export const QUIZ_TYPE_KATA = 'KATA';
export const QUIZ_TYPE_BOTH = 'BOTH';
export const QUIZ_QUESTION = 'que';
export const QUIZ_ANSWER = 'ans';
export const QUIZ_CHAT = 'comm';
export const QUIZ_MEDIA_TYPE = 'mtype';
export const QUIZ_MEDIA_IMAGE = 'IMAGE';
export const QUIZ_MEDIA_AUDIO = 'AUDIO';
export const QUIZ_MEDIA_PATH = 'mpath';

const GameTitle = () => (
  <Header as="h1" textAlign="center" style={{ margin: '2%' }}>
    しりとり形式クイズ
  </Header>
);

const GamePlayer = ({ puzzleResource }) => {
  let puzzle = puzzleResource.read();
  const quizTotal = puzzle.length - 1 - 1; // minus rule and msg
  const [currQuiz, setCurrQuiz] = useState(0);
  const {
    [QUIZ_ID]: quizNum,
    [QUIZ_TYPE]: quizType,
    [QUIZ_QUESTION]: quizQue,
    [QUIZ_ANSWER]: quizAns,
    [QUIZ_CHAT]: quizChat,
    [QUIZ_MEDIA_TYPE]: quizMediaType,
    [QUIZ_MEDIA_PATH]: quizMediaPath,
  } = puzzle[currQuiz];

  const [failedBefore, setFailedBefore, removeFailedBefore] = useLocalStorage(process.env.REACT_APP_FAIL_LSKEY, false);
  const [retries, setRetries] = useState(
    failedBefore ? 0 : process.env.REACT_APP_RETRIES_NUM || 3
  );
  const [last2Answers, setLast2Answers] = useState([]);
  const [leftColHeight, setLeftColHeight] = useState(null);
  const contentHeightRef = useRef({});
  const leftColRef = useRef(null);

  useLayoutEffect(() => {
    const { height } = leftColRef.current.getBoundingClientRect();
    if (height && !leftColHeight || leftColHeight < height) {
      setLeftColHeight(height);
    }
  }, [currQuiz]);

  useEffect(() => {
    let id,
      ignore = false;
    if (!ignore && retries === -1) {
      // dim quizbox after delay to signal gameover and player have time to read notif inside
      id = setTimeout(() => setRetries(retries - 1), 5000);
    }
    return () => {
      ignore = true;
      if (retries === -1) clearTimeout(id);
    };
  }, [retries]);

  const quizResource = useMemo(
    () => ({
      content: fetchLocal(
        { quizNum, quizType, quizQue, quizAns, quizMediaType },
        quizType === QUIZ_TYPE_RULE ? 0 : 1000
      ),
      msg: quizType === QUIZ_TYPE_MSG ? fetchBdmsg() : fetchLocal(),
      media: quizMediaPath ? fetchMedia(quizMediaPath) : fetchLocal(),
    }),
    [currQuiz]
  );

  const updateContentHeight = ({ quiz, notif }) => {
    if (!quiz && !notif) return;
    const { quiz: prevQuiz, notif: prevNotif } = contentHeightRef.current;
    if (
      (!prevQuiz && quiz) ||
      quiz > prevQuiz ||
      (!prevNotif && notif) ||
      notif > prevNotif
    ) {
      contentHeightRef.current = {
        quiz: (!prevQuiz && quiz) || quiz > prevQuiz ? quiz : prevQuiz,
        notif: (!prevNotif && notif) || notif > prevNotif ? notif : prevNotif,
      };
    }
  };

  const addAnswer = (answer) => {
    if (answer.length == 2) setLast2Answers(answer.splice(-2));
    else {
      if (last2Answers.length < 2) setLast2Answers([...last2Answers, answer]);
      else setLast2Answers([last2Answers[1], answer]);
    }
  };

  const setNext = () => {
    if (retries < 0) {
      setRetries(0);
      setCurrQuiz(0);
    } else {
      const next = currQuiz + 1 > puzzle.length - 1 ? 0 : currQuiz + 1;
      if (next === puzzle.length - 1) removeFailedBefore();
      setCurrQuiz(next);
    }
  };

  const handleCorrectAnswer = (answer) => {
    addAnswer(
      currQuiz >= quizTotal
        ? [answer, puzzle[puzzle.length - 1][QUIZ_ANSWER]]
        : answer
    ); // add msg answer if on last question
    setNext();
  };

  const handleWrongAnswer = () => {
    const retriesUpdate = retries - 1;
    if (retriesUpdate < 0) setFailedBefore(true);
    setRetries(retriesUpdate);
  };

  return (
    <Container style={{ margin: '1%' }}>
      <GameTitle />
      <Divider hidden />
      <GameStatus
        retries={retries}
        totalQuestionNum={quizTotal}
        currQuestionNum={currQuiz}
      />
      <Divider hidden />
      <Divider hidden />
      <Grid columns="equal" divided>
        <Grid.Row stretched>
        <Ref innerRef={leftColRef}>
          <Grid.Column width={11}>
            <AnswerHighlight
              answers={last2Answers}
              hasMsg={currQuiz === puzzle.length - 1}
            />
            <Divider hidden />
            <Dimmer.Dimmable blurring dimmed={retries < -1}>
              <QuizBoxSpWrapper
                retries={retries}
                quizNum={currQuiz}
                quizTotalNum={quizTotal}
                quizResource={quizResource}
                handleCorrectAnswer={handleCorrectAnswer}
                handleWrongAnswer={handleWrongAnswer}
                contentHeight={contentHeightRef.current}
                updateContentHeight={updateContentHeight}
              />
              <Dimmer active={retries < -1} style={{ display: 'grid' }}>
                <Header as="h3" inverted style={{ margin: 'auto' }}>
                  残念、ゲームオーバーです
                </Header>
                <Divider hidden />
                <Button
                  icon="redo"
                  labelPosition="left"
                  content="リスタート"
                  onClick={setNext}
                />
              </Dimmer>
            </Dimmer.Dimmable>
          </Grid.Column>
          </Ref>
          <Grid.Column {...(leftColHeight ? { style: { maxHeight: leftColHeight } } : {})}>
            <ChatBox
              chat={quizChat}
              retries={retries}
              neighborContentHeight={null}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

const GamePlayerFallback = () => (
  <Container style={{ margin: '1%' }}>
    <GameTitle />
    <Divider hidden />
    <GameStatus />
    <Divider hidden />
    <Divider hidden />
    <Loader active />
  </Container>
);

export const GamePlayerSpWrapper = (props) => (
  <Suspense fallback={<GamePlayerFallback />}>
    <GamePlayer {...props} />
  </Suspense>
);
