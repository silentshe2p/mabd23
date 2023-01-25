import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Form, Header } from 'semantic-ui-react';
import { Notification, NOTIF } from '../components/Notification';
import { useAuth } from '../lib/contexts';

export const Login = () => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { state } = useLocation();
  const { providedUser, loginError, pathname } = state || {};
  const redirect = pathname || '/app'; // path before get redirected here if applicable
  const [errorMsg, setErrorMsg] = useState(loginError?.message || null);
  const submittedWrongUsers = useRef([]); // users failed to be logged in

  const resetError = () => {
    if (errorMsg) setErrorMsg(null);
  };

  const onChange = (e) => {
    resetError();
    setUserName(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(userName, redirect);
    setIsLoading(false);
  };

  useEffect(() => {
    const possibleNewErrorMsg = loginError?.message;
    if (possibleNewErrorMsg && possibleNewErrorMsg !== errorMsg) {
      // login failed, got navigated back to /login with new error
      setErrorMsg(possibleNewErrorMsg);
    }
    if (providedUser && !submittedWrongUsers.current.includes(providedUser)) {
      // login failed, save submittted user for future validation
      submittedWrongUsers.current.push(providedUser);
    }
  }, [state]);

  return (
    <Container style={{ margin: '5%' }}>
      <Header as="h2">ログイン</Header>
      {errorMsg ? (
        <Notification
          type={NOTIF.ERROR}
          header="ログインエラー"
          message={errorMsg}
        />
      ) : (
        <Notification
          type={NOTIF.INFO}
          header="このサイトでは、ある特定の人しかアクセスできません"
          message="名前を入力してみてください"
        />
      )}
      <Form onSubmit={onSubmit}>
        <Form.Group
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}
        >
          <Form.Input
            label="名前"
            name="name"
            value={userName}
            disabled={isLoading}
            onChange={onChange}
            onFocus={resetError}
            error={
              submittedWrongUsers.current.includes(userName)
                ? {
                    content: 'チェック済み不明ユーザー',
                    pointing: 'above',
                  }
                : null
            }
          />
          <Form.Button
            primary
            disabled={
              isLoading ||
              !!errorMsg ||
              submittedWrongUsers.current.includes(userName)
            }
          >
            {isLoading ? 'チェックイング...' : 'チェック'}
          </Form.Button>
        </Form.Group>
      </Form>
    </Container>
  );
};
