import {TextInput, TextInputProps, TextStyle} from 'react-native';
import {scale} from 'react-native-size-matters';

interface ITextBoxProps extends TextInputProps {
  style?: TextStyle;
  props?: TextInputProps;
}

const TextBox: React.FC<ITextBoxProps> = ({style, ...props}) => {
  return (
    <TextInput
      multiline
      style={{
        backgroundColor: '#0a0a0a',
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(12),
        color: '#fff',
        fontSize: scale(16),
        marginBottom: scale(20),
        ...style,
      }}
      {...props}
    />
  );
};

export default TextBox;
