import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Divider,
  Header,
  Placeholder,
  Progress,
  Segment,
  Ref,
} from 'semantic-ui-react';
import { AnswerInput } from './AnswerInput';
import { Notification, NOTIF } from './Notification';
import { QuizContent } from './QuizContent';
import {
  QUIZ_TYPE_RULE,
  QUIZ_TYPE_MSG,
  QUIZ_TYPE_HIRA,
  QUIZ_TYPE_KATA,
  QUIZ_TYPE_BOTH,
} from './GamePlayer';

const calcProgressPercent = (current, total) => {
  const currentNormalized = Math.abs(current > total ? total : current);
  const totalNormalized = Math.abs(total === 0 ? 1 : total);
  return (currentNormalized / totalNormalized) * 100;
};

const typeToText = (type) => {
  switch (type) {
    case QUIZ_TYPE_RULE:
      return 'ルール';
    case QUIZ_TYPE_HIRA:
      return 'ひらがな';
    case QUIZ_TYPE_KATA:
      return 'カタカナ';
    case QUIZ_TYPE_BOTH:
      return 'ひらがな+カタカナ';
    case QUIZ_TYPE_MSG:
      return 'ゴール';
    default:
      return '不明';
  }
};

const QuizBox = ({
  retries,
  quizTotalNum,
  quizResource,
  handleCorrectAnswer,
  handleWrongAnswer,
  contentHeight,
  updateContentHeight,
}) => {
  const quizData = quizResource.content.read();
  const quizMediaUrl = quizResource.media.read();

  const { quizNum, quizType, quizQue, quizAns, quizMediaType } = quizData;
  const msg = quizType === QUIZ_TYPE_MSG ? quizResource.msg.read() : '';

  const [notif, setNotif] = useState(null);
  const [inputChanged, setInputChanged] = useState(false);
  const quizRef = useRef(null);
  const notifRef = useRef(null);
  const { quiz: quizHeight, notif: notifHeight } = contentHeight;

  useEffect(() => {
    if (notif) {
      updateContentHeight({
        quiz: quizRef.current?.clientHeight
          ? quizRef.current.clientHeight * 0.5
          : null,
        notif: notifRef.current?.clientHeight
          ? notifRef.current.clientHeight * 0.5
          : null,
      });
    }
  }, [notif]);

  const handleTransition = (answer) => {
    handleCorrectAnswer(answer);
    setNotif(null);
  };

  const handleSubmit = (answer) => {
    setInputChanged(false);
    if (answer === quizAns) {
      setNotif({
        type: NOTIF.SUCCESS,
        header: 'おめでとう⭕',
        message: `正解は、ご回答の通り「${answer}」でした！${
          quizNum >= quizTotalNum
            ? 'パズルが完成しました。Bからのメッセージを読み込み中...'
            : '次の質問を読み込み中...'
        }`,
        handleDismiss: () => handleTransition(answer),
      });
    } else {
      if (quizType === QUIZ_TYPE_RULE) {
        setNotif({
          type: NOTIF.INFO,
          header: 'はじめよう！',
          message: `最初の質問質問を読み込み中...`,
          handleDismiss: () => handleTransition(answer),
        });
      } else {
        setNotif({
          type: NOTIF.ERROR,
          header: '残念❌',
          message: `現在の答え「${answer}」は不正解です。${
            retries <= 1
              ? retries == 1
                ? 'リトライ回数を使い切ったので、次の不正解でゲームオーバーです。'
                : 'リトライが残っていないので、ゲームオーバーになります。「リスタート」ボタンでゲームを再開してください。'
              : 'もう一度やり直してください。'
          }`,
          handleDismiss: () => setNotif(null),
        });
        handleWrongAnswer(answer);
      }
    }
  };

  return (
    <Segment>
      <Progress
        percent={calcProgressPercent(quizNum, quizTotalNum)}
        attached="top"
        indicating
      />
      {notif ? (
        <Ref innerRef={notifRef}>
          <Notification
            message={notif.message}
            type={notif.type}
            header={notif.header}
            dismissable={notif.type === NOTIF.ERROR && retries >= 1} // can be dismissed on normal answer
            autoDismissable={
              (notif.type === NOTIF.ERROR && retries < 0) ||
              notif.type !== NOTIF.ERROR
            } // autodismiss on rule, correct answer and gameover
            handleDismiss={notif.handleDismiss}
            forceDismiss={notif.type === NOTIF.ERROR && inputChanged} // dismiss error notification when user reenters answer
          />
        </Ref>
      ) : (
        <>
          <Header
            as="h3"
            textAlign="center"
            style={{
              ...(notifHeight ? { minHeight: notifHeight } : { margin: '5%' }),
            }}
          >
            {typeToText(quizType)}
          </Header>
        </>
      )}
      <Ref innerRef={quizRef}>
        <QuizContent
          {...(quizHeight ? { style: { minHeight: quizHeight } } : {})}
          quizNum={quizNum}
          quizType={quizType}
          quizQue={
            quizType === QUIZ_TYPE_RULE
              ? { summary: quizQue, detail: quizAns }
              : quizQue
          }
          {...(quizMediaType ? { quizMediaType } : {})}
          {...(quizMediaUrl ? { quizMediaUrl } : {})}
          {...(msg ? { msg } : {})}
        />
      </Ref>
      <Divider hidden />
      {quizType !== QUIZ_TYPE_MSG ? (
        <AnswerInput
          type={quizType}
          disabled={retries < 0 || (notif && notif.type !== NOTIF.ERROR)}
          handleInputChanged={() => setInputChanged(true)}
          handleSubmit={handleSubmit}
        />
      ) : (
        <Divider hidden />
      )}
      <Progress
        percent={calcProgressPercent(quizNum, quizTotalNum)}
        attached="bottom"
        indicating
      />
    </Segment>
  );
};

const QuizBoxFallback = ({ quizNum, quizTotalNum, contentHeight }) => {
  const { quiz: quizHeight, notif: notifHeight } = contentHeight;
  return (
    <Segment>
      <Progress
        percent={calcProgressPercent(quizNum, quizTotalNum)}
        attached="top"
        indicating
      />
      <Header
        as="h3"
        textAlign="center"
        style={{
          ...(notifHeight ? { minHeight: notifHeight } : { margin: '5%' }),
        }}
      >
        ローディング
      </Header>
      <Placeholder
        style={{
          margin: '3%',
          ...(quizHeight ? { minHeight: quizHeight } : {}),
        }}
      >
        <Placeholder.Line length="short" />
        <Placeholder.Paragraph>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Paragraph>
      </Placeholder>
      <Divider hidden />
      {quizNum > quizTotalNum ? (
        <AnswerInput
          type={null}
          disabled={true}
          handleInputChanged={null}
          handleSubmit={null}
        />
      ) : (
        <Divider hidden />
      )}
      <Progress
        percent={calcProgressPercent(quizNum, quizTotalNum)}
        attached="bottom"
        indicating
      />
    </Segment>
  );
};

export const QuizBoxSpWrapper = ({
  quizNum,
  quizTotalNum,
  contentHeight,
  ...props
}) => (
  <Suspense
    fallback={
      <QuizBoxFallback
        quizNum={quizNum}
        quizTotalNum={quizTotalNum}
        contentHeight={contentHeight}
      />
    }
  >
    <QuizBox
      quizTotalNum={quizTotalNum}
      contentHeight={contentHeight}
      {...props}
    />
  </Suspense>
);
