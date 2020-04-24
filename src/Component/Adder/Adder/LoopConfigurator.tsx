import React, {useContext, useState, useEffect, useCallback} from 'react';
import styled, {ThemeContext} from 'styled-components';
import {GIF, Sample, Configuration, getGifLength} from '../../../tools/gif';
import {Player} from '../../Player';
import {Back} from '../../Style/Back';
import {Cutter} from './LoopConfigurator/Cutter';
import {SampleModeSelector} from './LoopConfigurator/SampleModeSelector';
import {sendEvent, UserEvent} from '../../../tools/analytics';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.theme.addModal.windowSize - props.theme.addModal.spacing}px;
  height: ${(props) => props.theme.addModal.windowSize}px;
  padding: ${(props) => props.theme.addModal.spacing}px;
  background: rgb(208, 208, 208);
  box-sizing: border-box;
  justify-content: space-between;
  position: relative;
`;

const Submit = styled.span`
  background-color: ${(props) => props.theme.color.yellow};
  color: black;
  margin: 20px 0;
  padding: 10px 5px;
  font-size: 20px;
  text-align: center;
  text-transform: uppercase;

  &:hover {
    cursor: pointer;
  }
`;

const Configurator = styled.div`
  display: flex;
  flex-direction: column;
`;

const MIN_GIF_SIZE = 3;

enum Size {
  Short = 'short',
  Medium = 'medium',
  Long = 'long',
}

const LoopConfigurator = ({
  gif,
  onLoopConfirmation,
  previous,
}: {
  gif: GIF;
  previous: boolean;
  onLoopConfirmation: (mode: Configuration | null) => void;
}) => {
  const theme = useContext(ThemeContext);
  const [configuration, setConfiguration] = useState({start: 0, end: getGifLength(gif), mode: Sample.Sample});
  const [size, setSize] = useState<Size>(Size.Long);

  useEffect(() => {
    if (MIN_GIF_SIZE >= gif.length) {
      setConfiguration({start: 0, end: getGifLength(gif), mode: Sample.Sample});
      setSize(Size.Short);
    } else if (2000 >= getGifLength(gif)) {
      setConfiguration({start: 0, end: getGifLength(gif), mode: Sample.Sample});
      setSize(Size.Medium);
    } else {
      setConfiguration({start: 0, end: 2000, mode: Sample.Trim});
      setSize(Size.Long);
    }
  }, [gif]);

  const onModeChange = useCallback(
    (newMode: Sample) => {
      const newStartEnd =
        newMode === Sample.Trim
          ? {
              start: newMode === Sample.Trim ? 0 : configuration.start,
              end: newMode === Sample.Trim ? 2000 : configuration.end,
            }
          : {};
      setConfiguration({
        ...configuration,
        mode: newMode,
        ...newStartEnd,
      });
    },
    [configuration]
  );

  const onCutChange = useCallback(
    (start: number, end: number) => {
      setConfiguration({...configuration, start, end});
    },
    [configuration]
  );

  useEffect(() => {
    if (
      !(0 === configuration.start && getGifLength(gif) === configuration.end && configuration.mode === Sample.Sample) &&
      !(0 === configuration.start && 2000 === configuration.end && configuration.mode === Sample.Trim)
    )
      sendEvent(UserEvent.ConfigurationChange, configuration);
  }, [configuration, gif]);

  return (
    <Container>
      {gif.length !== 0 && (
        <>
          <Configurator>
            <Player
              gif={gif}
              configuration={configuration}
              width={theme.addModal.windowSize - theme.addModal.spacing * MIN_GIF_SIZE}
            />
            {Size.Long === size && <SampleModeSelector mode={configuration.mode} onChange={onModeChange} />}
            {Size.Short !== size && (
              <Cutter
                length={getGifLength(gif)}
                start={configuration.start}
                end={configuration.end}
                mode={configuration.mode}
                gif={gif}
                onChange={onCutChange}
              />
            )}
          </Configurator>
          <Submit
            onClick={() => {
              onLoopConfirmation(configuration);
            }}
          >
            Confirm
          </Submit>
        </>
      )}
      {previous && (
        <Back vertical={true} onClick={() => onLoopConfirmation(null)}>
          Back
        </Back>
      )}
    </Container>
  );
};

export {LoopConfigurator};
