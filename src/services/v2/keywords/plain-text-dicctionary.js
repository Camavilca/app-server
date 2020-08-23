export default function ConverPlainDictionary(keywordsArr) {
  let plainText = keywordsArr.reduce((accumulator, currentValue) => {
    return accumulator + currentValue[0] + " ";
  }, "");
  return plainText;
}
