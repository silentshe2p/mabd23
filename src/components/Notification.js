import React, { useState, useEffect, useRef } from 'react';
import { Message, Transition } from 'semantic-ui-react';
import { useTimeout } from '../lib/hooks';

export const TRANSITION_ANIMATION = 'drop';
export const TRANSITION_DURATION = 500;
export const AUTO_DISMISS_DEFAULT = 4000;

export const NOTIF = {
  INFO: Symbol('info'),
  WARN: Symbol('warn'),
  SUCCESS: Symbol('success'),
  ERROR: Symbol('error'),
};

// Current dismiss options must either autoDismissable OR dismissable with optional forceDismiss
// autoDismissable will automatically dismiss it after delay specified by autoDismissTimeInSeconds
// dismissable will show close button which can either be activated by clicking it or setting forceDismiss
// TODO: enforce above OR condition
export const Notification = ({
  message,
  type,
  header = '',
  style = {},
  dismissable = false,
  autoDismissable = false,
  autoDismissTimeInSeconds = AUTO_DISMISS_DEFAULT,
  forceDismiss = false,
  handleDismiss = null,
}) => {
  const [visible, setVisible] = useState(true);
  const notifType = type?.description || NOTIF.INFO.description;
  const invokeHandleDismiss = useRef(false);

  const onDimiss = () => {
    setVisible(false);
    if (handleDismiss) handleDismiss();
  };

  useEffect(() => {
    if (handleDismiss && autoDismissable && !visible && invokeHandleDismiss) {
      // autoDismissable option
      invokeHandleDismiss.current = false;
      handleDismiss();
    }
    if (dismissable && visible && forceDismiss) {
      // dismissable option with forceDismiss activated
      onDimiss();
    }
  }, [visible, dismissable, autoDismissable, forceDismiss, handleDismiss]);

  useTimeout(
    () => {
      // autoDismissable option, signal useEffect to invoke any handleDismiss after it has been dismissed
      if (autoDismissable) {
        setVisible(false);
        invokeHandleDismiss.current = true;
      }
    },
    !autoDismissable || autoDismissTimeInSeconds <= 0
      ? null
      : autoDismissTimeInSeconds
  );

  return (
    <Transition.Group
      animation={TRANSITION_ANIMATION}
      duration={TRANSITION_DURATION}
    >
      {visible && (
        <Message
          {...(style ? { style } : {})}
          {...{ [notifType]: true }}
          {...(header ? { header } : {})}
          content={message}
          onDismiss={dismissable ? onDimiss : null}
        />
      )}
    </Transition.Group>
  );
};
