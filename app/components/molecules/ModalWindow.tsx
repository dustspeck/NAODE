import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Modal,
  Animated,
  useWindowDimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import {IParentBounds} from '../../models/OverlayModel';
import Label from '../atoms/Label';
import { scale } from 'react-native-size-matters';

interface IModalProps {
  isVisible: boolean;
  heading: string;
  subHeading?: string;
  content: React.FC | (() => Promise<React.ReactNode>);
  headerContent?: React.FC;
  footerContent?: React.ReactNode;
  parentBounds?: IParentBounds;
  onBackPressed: () => void;
  isLoading?: boolean;
}

const ModalWindow: React.FC<IModalProps> = props => {
  const ANIMATION_DURATION = 160;
  const {
    content,
    heading,
    isVisible,
    headerContent,
    footerContent,
    subHeading,
    parentBounds,
    onBackPressed,
    isLoading,
  } = props;

  const [isVisibleInternal, setIsVisibleInternal] = useState(false);
  const {width, height} = useWindowDimensions();
  const [contentNode, setContentNode] = useState<React.ReactNode>(null);

  const defaultParentBounds = parentBounds || {x: 0, y: 0, height, width};
  const parent = defaultParentBounds;
  const parentOriginX = 2 * parent.x + parent.width - width;
  const parentOriginY = 2 * parent.y + parent.height - height;

  const translation = useRef(new Animated.Value(0)).current;
  const fadeInOutX = Animated.multiply(
    Animated.subtract(1, translation),
    parentOriginX,
  );
  const fadeInOutY = Animated.multiply(
    Animated.subtract(1, translation),
    parentOriginY,
  );

  const entryExitAnimation = Animated.timing(translation, {
    useNativeDriver: true,
    toValue: isVisible ? 1 : 0,
    duration: ANIMATION_DURATION,
  });

  useEffect(() => {
    if (isVisible) {
      translation.setValue(0);
      setIsVisibleInternal(true);
      entryExitAnimation.start();
    } else {
      translation.setValue(1);
      entryExitAnimation.start(() => {
        setIsVisibleInternal(false);
      });
    }
  }, [isVisible]);

  useEffect(() => {
    const renderContent = async () => {
      if (!content) return;
      
      try {
        const result = content({});
        if (result instanceof Promise) {
          const resolvedContent = await result;
          setContentNode(resolvedContent);
        } else {
          setContentNode(result);
        }
      } catch (error) {
        console.error('Error rendering modal content:', error);
        setContentNode(null);
      }
    };

    renderContent();
  }, [content]);

  if (isLoading) return;
  if (!isVisibleInternal) return;
  return (
    <Modal transparent={true} onRequestClose={onBackPressed} statusBarTranslucent>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Animated.View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: '#050505bb',
            opacity: translation,
          }}>
          <Animated.View
            style={{
              width: '80%',
              backgroundColor: '#111',
              padding: scale(20),
              paddingTop:scale(20),
              borderRadius: scale(15),
              maxHeight: 0.85 * height,
              marginTop:StatusBar.currentHeight,
              transform: [
                {scale: translation},
                {translateX: fadeInOutX},
                {translateY: fadeInOutY},
              ],
              opacity: translation,
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View>
                <Label
                  style={{fontWeight: '700', marginBottom: subHeading ? 0 : scale(20), fontSize:12}}
                  text={heading}
                />
                {subHeading && (
                  <Label
                    style={{color: '#888', marginBottom: scale(10), fontSize:10}}
                    text={subHeading}
                  />
                )}
              </View>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled>
              <View style={{marginTop: scale(5)}}>{contentNode}</View>
            </ScrollView>
            <View>{footerContent}</View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ModalWindow;
