import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Container,
  Dimmer,
  Divider,
  Header,
  Icon,
  Image,
  Modal,
  Placeholder,
  Segment,
} from 'semantic-ui-react';
import ReactAudioPlayer from 'react-audio-player';
import {
  QUIZ_TYPE_RULE,
  QUIZ_TYPE_MSG,
  QUIZ_MEDIA_AUDIO,
  QUIZ_MEDIA_IMAGE,
} from './GamePlayer';
import { useAuth } from '../lib/contexts';
import { postCompletion } from '../lib/api'; // TODO: lift to parent

export const QuizContent = ({
  quizNum,
  quizType,
  quizQue,
  quizMediaType = '',
  quizMediaUrl = '',
  msg = '',
  style = {},
}) => {
  const { user } = useAuth();
  const [mediaLoading, setMediaLoading] = useState(false);
  const audioElRef = useRef(null);
  const postedCompletion = useRef(false);

  const onClickMsg = async () => {
    audioElRef.current.audioEl.current.play();
    if (!postedCompletion.current) {
      await postCompletion(user);
      postedCompletion.current = true;
    }
  };

  useEffect(() => {
    if (quizMediaType !== QUIZ_TYPE_MSG && !!quizMediaUrl && !mediaLoading) {
      setMediaLoading(true);
    }
  }, [quizNum, quizMediaType, quizMediaUrl]);

  return (
    <Container {...(style ? { style } : {})}>
      {quizType === QUIZ_TYPE_RULE ? (
        <Header as="h3" style={{ margin: '1%' }}>
          {quizQue.summary}
          <Divider clearing />
          <Header.Subheader>{quizQue.detail}</Header.Subheader>
        </Header>
      ) : quizType === QUIZ_TYPE_MSG ? (
        <>
          <Header as="h3" style={{ margin: '1%' }}>
            パズル完成お疲れ様でした ✨
            <Divider clearing />
            <Header.Subheader>
              しりとりルールのエンディングメッセージが追加されました ⬆️
            </Header.Subheader>
          </Header>
          <div hidden>
            <ReactAudioPlayer
              ref={(el) => (audioElRef.current = el)}
              src={quizMediaUrl}
              controls
              loop
            />
          </div>
          <Divider hidden />
          <Modal
            closeIcon
            dimmer="blurring"
            trigger={
              <Button basic color="green" onClick={onClickMsg}>
                {`${user}へ`}
              </Button>
            }
            onClose={() => audioElRef.current.audioEl.current.pause()}
          >
            <Header icon="star" content={quizQue} />
            <Modal.Content scrolling style={{ whiteSpace: 'pre-wrap' }}>
              {msg}
            </Modal.Content>
          </Modal>
        </>
      ) : (
        <>
          <Divider horizontal>
            <Header as="h3" style={{ margin: '1%' }}>
              <Icon name="question circle" />
              問題{quizNum}
            </Header>
          </Divider>
          <Segment padded="very">{quizQue}</Segment>
        </>
      )}
      {quizMediaType === QUIZ_MEDIA_IMAGE && !!quizMediaUrl && (
        <>
          <Divider hidden />
          {mediaLoading && (
            <Placeholder>
              <Placeholder.Image size="medium" rectangular />
            </Placeholder>
          )}
          <Image
            src={quizMediaUrl}
            size="medium"
            centered
            rounded
            onLoad={() => setMediaLoading(false)}
          />
        </>
      )}
      {quizMediaType === QUIZ_MEDIA_AUDIO &&
        !!quizMediaUrl &&
        quizType !== QUIZ_TYPE_MSG && (
          <>
            <Divider hidden />
            <Dimmer.Dimmable blurring dimmed={mediaLoading}>
              <ReactAudioPlayer
                ref={(el) => (audioElRef.current = el)}
                src={quizMediaUrl}
                autoPlay
                controls
                onCanPlayThrough={() => setMediaLoading(false)}
              />
            </Dimmer.Dimmable>
          </>
        )}
    </Container>
  );
};
