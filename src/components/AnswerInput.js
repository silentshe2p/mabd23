import React, { useState, useEffect } from 'react';
import { Divider, Form } from 'semantic-ui-react';
import { isHira, isKata } from '../lib/shiritori';
import {
  QUIZ_TYPE_RULE,
  QUIZ_TYPE_HIRA,
  QUIZ_TYPE_KATA,
  QUIZ_TYPE_BOTH,
} from './GamePlayer';

export const AnswerInput = ({
  type,
  handleInputChanged,
  handleSubmit,
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const isCorrectTyped = (type, str) => {
    switch (type) {
      case QUIZ_TYPE_HIRA:
        for (let chr of str) {
          if (!isHira(chr)) return false;
        }
        return true;
      case QUIZ_TYPE_KATA:
        for (let chr of str) {
          if (!isKata(chr)) return false;
        }
        return true;
      case QUIZ_TYPE_BOTH:
        for (let chr of str) {
          if (!isHira(chr) && !isKata(chr)) return false;
        }
        return true;
      default:
        return false;
    }
  };

  const typeToText = (type) => {
    switch (type) {
      case QUIZ_TYPE_HIRA:
        return 'ひらがな';
      case QUIZ_TYPE_KATA:
        return 'カタカナ';
      case QUIZ_TYPE_BOTH:
        return 'ひらがな＋カタカナ';
      default:
        return '不明';
    }
  };

  const checkAnswer = () => {
    // check input type correctness
    if (type !== QUIZ_TYPE_RULE && !isCorrectTyped(type, answer)) {
      setError(
        `現在の回答は、必要なタイプ「${typeToText(type)}」ではありません`
      );
    }
  };

  useEffect(() => {
    // checkAnswer debounced
    let id,
      ignore = false;
    if (answer) {
      id = setTimeout(() => {
        if (!ignore) checkAnswer();
      }, 500);
    }
    return () => {
      ignore = true;
      if (answer) clearTimeout(id);
    };
  }, [answer]);

  const onChange = (e) => {
    if (error) setError('');
    setAnswer(e.target.value);
    handleInputChanged();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    checkAnswer();
    if (!error) {
      handleSubmit(answer.trim());
      setAnswer('');
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        <Form.Input
          placeholder="解答"
          width={12}
          disabled={disabled}
          name="answer"
          value={answer}
          error={error ? { content: error, pointing: 'above' } : null}
          onChange={onChange}
        />
        <Form.Button
          primary
          loading={!!disabled}
          disabled={disabled || !!error}
          content={type === QUIZ_TYPE_RULE ? 'スタート' : '決める'}
        />
        {!error && <Divider hidden />}
      </Form.Group>
    </Form>
  );
};
