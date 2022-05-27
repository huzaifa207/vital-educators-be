/* eslint-disable */

const Filter = require('bad-words');
const filter = new Filter();

/* eslint-enable */

function is_email_detect() {
  return /^.*?(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})).*?$/;
}

function remove_bad_words(msg: string) {
  return filter.clean(msg);
}
function is_phone_detect() {
  return /^.*?\s*?[\+]?[(]?[0-9]{3,4}[)]?[-?\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}.*?$/im;
}

function is_valid_msg(msg: string): { valid: boolean; error: string } {
  if (is_email_detect().test(msg)) {
    return {
      valid: false,
      error: 'Email is not allowed',
    };
  }

  if (is_phone_detect().test(remove_bad_words(msg))) {
    return {
      valid: false,
      error: 'Phone number is not allowed',
    };
  }
  return {
    valid: true,
    error: '',
  };
}

export { remove_bad_words, is_phone_detect, is_valid_msg };
