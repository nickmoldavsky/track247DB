import * as Clipboard from "expo-clipboard";

const CopyToClipboardHelper = {
  copyToClipboard: async (value) => {
    await Clipboard.setStringAsync(value);
  },

  fetchCopiedText: async () => {
    const text = await Clipboard.getStringAsync();
    console.log('fetchCopiedText: ', text)
    return text !== null ? text : null;
  },
};

export default CopyToClipboardHelper;
