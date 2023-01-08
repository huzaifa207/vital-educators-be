const Base64 = () => {
  return {
    encode: (str: number) => {
      return Buffer.from(String(str)).toString('base64');
    },
    decode: (str: string) => {
      return Buffer.from(str, 'base64').toString('ascii');
    },
  };
};

export default Base64;
