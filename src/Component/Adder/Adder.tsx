import React, {useState, useEffect} from 'react';
import {GIF, Configuration} from '../../tools/gif';
import styled from 'styled-components';
import {SourceSelector} from './Adder/SourceSelector';
import {LoopConfigurator} from './Adder/LoopConfigurator';
import {SpriteSelector} from './Adder/SpriteSelector';
import {Loop} from '../../model/loop';
import {useBooleanState} from '../../hooks/boolean';
import {sendEvent, UserEvent} from '../../tools/analytics';

const Container = styled.div<{isVisible: boolean}>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${(props) => (props.isVisible ? 1 : 0)};

  transition: opacity 0.5s ease-in-out;
`;

const Modal = styled.div`
  width: ${(props) => props.theme.addModal.windowSize}px;
  height: ${(props) => props.theme.addModal.windowSize + props.theme.addModal.spacing}px;
  background: ${(props) => props.theme.color.white};
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
`;

const Scroller = styled.div<{level: number}>`
  width: ${(props) => props.theme.addModal.windowSize * 3}px;
  display: flex;
  transform: translate3d(
    -${(props) => props.level * (props.theme.addModal.windowSize - props.theme.addModal.spacing)}px,
    0,
    0
  );
  transition: transform 0.5s ease-in-out;
`;

const Header = styled.div`
  height: ${(props) => props.theme.addModal.spacing}px;
  width: ${(props) => props.theme.addModal.windowSize}px;
  background: ${(props) => props.theme.color.grey};
  color: white;
  position: relative;
  z-index: 10;
`;

const Dismiss = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  line-height: ${(props) => props.theme.addModal.spacing}px;
  width: ${(props) => props.theme.addModal.spacing}px;
  text-align: center;
  font-size: 30px;
  font-weight: 100;

  &:hover {
    cursor: pointer;
  }
`;

const Title = styled.div`
  width: 100%;
  height: 100%;
  line-height: ${(props) => props.theme.addModal.spacing}px;
  text-align: center;
  font-size: 25px;
  font-weight: 200;
`;

const getLevel = (gif: GIF, configuration: Configuration | null): number => {
  if (null !== configuration) {
    return 2;
  }
  if (0 !== gif.length) {
    return 1;
  }

  return 0;
};

const Adder = ({
  initialSprite = null,
  onLoopAdd,
  dismissModal,
}: {
  initialSprite?: number | null;
  onLoopAdd: (loop: Loop) => void;
  dismissModal: () => void;
}) => {
  const [gif, setGif] = useState<GIF>([]);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [sprite, setSprite] = useState<number | null>(initialSprite);
  const [isVisible, show] = useBooleanState(false);

  useEffect(() => {
    setImmediate(() => show());
  }, [show]);

  useEffect(() => {
    if (0 !== gif.length && null !== configuration && null !== sprite) {
      onLoopAdd({
        gif,
        configuration,
        sprite,
      });
    }
  }, [gif, configuration, sprite, onLoopAdd]);

  return (
    <Container isVisible={isVisible}>
      <Modal>
        <Header>
          <Dismiss
            onClick={() => {
              if (null !== configuration) {
                sendEvent(UserEvent.CancelAdd, {from: 'sprite'});
              } else if (0 !== gif.length) {
                sendEvent(UserEvent.CancelAdd, {from: 'configure'});
              } else {
                sendEvent(UserEvent.CancelAdd, {from: 'start'});
              }

              dismissModal();
            }}
          >
            X
          </Dismiss>
          <Title>Add a loop</Title>
        </Header>
        <Scroller level={getLevel(gif, configuration)}>
          <SourceSelector
            previous={0 !== gif.length}
            onGifSelected={(newGif: GIF) => {
              setGif(newGif);
            }}
          />
          <LoopConfigurator
            previous={null !== configuration}
            gif={gif}
            onLoopConfirmation={(configuration) => {
              setConfiguration(configuration);
            }}
          />
          <SpriteSelector
            onSpriteConfirmation={(sprite: number) => {
              setSprite(sprite);
            }}
          />
        </Scroller>
      </Modal>
    </Container>
  );
};

export {Adder};
