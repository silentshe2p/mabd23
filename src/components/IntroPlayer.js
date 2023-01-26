import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Container,
  Comment,
  Divider,
  Icon,
  Message,
  Placeholder,
  Segment,
} from 'semantic-ui-react';
import { useCache } from '../lib/contexts';

const SECTION_CONTENT = 'content';
const SECTION_TYPE = 'type';
const INTRO_NARRATION = 'nar';
// const INTRO_CONVERSATION = 'cvs';
const MAT_NAME = 'まつり';
export const OAK_NAME = 'オーキド博士';
export const OAK_AVATAR_CACHE_KEY = 'oakAvatar';

const IntroPlayer = ({ introResource, setNextPart, fetchNextPart }) => {
  const sections = introResource.intro.read();
  const matAvatar = introResource.matAvatar.read();
  const oakAvatar = introResource.oakAvatar.read();

  const { setCache } = useCache();
  if (oakAvatar) setCache(OAK_AVATAR_CACHE_KEY, oakAvatar);

  const [sectionIdx, setSectionIdx] = useState(0);
  const [sectionContentIdx, setSectionContentIdx] = useState(0);
  const lastSectionIdx = sections.length - 1;
  const startedFetchNextPart = useRef(false);

  const transition = () => {
    if (sectionContentIdx >= sections[sectionIdx][SECTION_CONTENT].length - 1) {
      // the end of current section
      if (sectionIdx >= lastSectionIdx) {
        // no more section, intro is completed, move to next part
        setNextPart();
      } else {
        if (!startedFetchNextPart.current) {
          fetchNextPart(); // start fetching data for next part
          startedFetchNextPart.current = true;
        }
        // move to next section
        setSectionIdx(sectionIdx + 1);
        setSectionContentIdx(0);
      }
    } else if (
      sectionContentIdx < sections[sectionIdx][SECTION_CONTENT].length - 1 &&
      sectionIdx <= lastSectionIdx
    ) {
      setSectionContentIdx(sectionContentIdx + 1); // continue along the current section
    }
  };

  useEffect(() => {
    document.addEventListener('click', transition);
    return () => {
      document.removeEventListener('click', transition);
    };
  }, [transition]);

  const narrationRender = (narration) => (
    <Message icon floating size="massive" color="green">
      <Icon name="circle notched" loading />
      <Message.Content>{narration}</Message.Content>
    </Message>
  );

  const conversationRender = (conversation) => {
    const whom = Object.keys(conversation)[0];
    const said = conversation[whom];
    return (
      <Comment.Group size="massive">
        <Comment>
          <Comment.Avatar
            as='a'
            src={oakAvatar}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <Comment.Content>
            <Comment.Author>{OAK_NAME}</Comment.Author>
            <Comment.Text>
              <Segment color="red" size="big">
                {whom === OAK_NAME ? said : ''}
              </Segment>
            </Comment.Text>
          </Comment.Content>
        </Comment>
        <Divider hidden />
        <Comment>
          <Comment.Avatar
            as='a'
            src={matAvatar}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <Comment.Content>
            <Comment.Author>{MAT_NAME}</Comment.Author>
            <Comment.Text>
              <Segment color="teal" size="big">
                {whom === MAT_NAME ? said : ''}
              </Segment>
            </Comment.Text>
          </Comment.Content>
        </Comment>
      </Comment.Group>
    );
  };

  return (
    <Container style={{ margin: '5%' }}>
      {sections[sectionIdx][SECTION_TYPE] === INTRO_NARRATION
        ? narrationRender(
            sections[sectionIdx][SECTION_CONTENT][sectionContentIdx]
          )
        : conversationRender(
            sections[sectionIdx][SECTION_CONTENT][sectionContentIdx]
          )}
    </Container>
  );
};

const IntroPlayerFallback = () => (
  <Placeholder style={{ margin: '3%' }}>
    <Placeholder.Paragraph>
      <Placeholder.Line length="full" />
      <Placeholder.Line length="full" />
    </Placeholder.Paragraph>
    <Placeholder.Header image>
      <Placeholder.Line length="very long" />
      <Placeholder.Line length="very long" />
    </Placeholder.Header>
  </Placeholder>
);

export const IntroPlayerSpWrapper = (props) => (
  <Suspense fallback={<IntroPlayerFallback />}>
    <IntroPlayer {...props} />
  </Suspense>
);
