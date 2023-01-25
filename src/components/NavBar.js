import React, { Suspense } from 'react';
import { Button, Menu, Icon, Image, Placeholder } from 'semantic-ui-react';
import { GAME_INTRO, GAME_PUZZLE } from '../pages/Game';
import { useAuth } from '../lib/contexts';

const NavBar = ({ avatarResource, currentPart = null }) => {
  const { logout } = useAuth();
  const avatar = avatarResource.read();

  return (
    <Menu stackable style={{ margin: '1%' }}>
      <Menu.Item>
        <Image src={avatar} alt="avatar" style={{ height: 40, width: 40 }} />
      </Menu.Item>
      <Menu.Item name="intro" active={currentPart === GAME_INTRO}>
        <Icon name="text cursor" />
        イントロ
      </Menu.Item>
      <Menu.Item name="game" active={currentPart === GAME_PUZZLE}>
        <Icon name="game" />
        パズル
      </Menu.Item>
      <Menu.Menu position="right">
        <Menu.Item name="logout">
          <Button secondary onClick={logout}>
            ログアウト
          </Button>
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
};

const NavBarFallback = () => (
  <Menu stackable>
    <Menu.Item>
      <Placeholder style={{ height: 40, width: 40 }}>
        <Placeholder.Image />
      </Placeholder>
    </Menu.Item>
    <Menu.Item name="intro" active={true}>
      <Icon name="text cursor" />
      イントロ
    </Menu.Item>
    <Menu.Item name="game">
      <Icon name="game" />
      パズル
    </Menu.Item>
    <Menu.Menu position="right">
      <Menu.Item name="logout">
        <Button secondary disabled>
          ログアウト
        </Button>
      </Menu.Item>
    </Menu.Menu>
  </Menu>
);

export const NavBarSpWrapper = (props) => (
  <Suspense fallback={<NavBarFallback />}>
    <NavBar {...props} />
  </Suspense>
);
