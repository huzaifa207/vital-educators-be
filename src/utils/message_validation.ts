/* eslint-disable */

// const Filter = require('bad-words');
// const filter = new Filter();
var profanity = require('profanity-util');

/* eslint-enable */

function is_email_detect() {
  return /^.*?(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})).*?$/;
}

function remove_bad_words(msg: string) {
  return profanity.purify(msg)[0];
}

function is_phone_detect() {
  return /^.*?\s*?[\+]?[(]?[0-9]{3,4}[)]?[-?\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}.*?$/im;
}

function is_valid_msg(msg: string): { valid: boolean; error: string } {
  if (is_email_detect().test(msg)) {
    return {
      valid: false,
      error: 'Sharing email is not allowed. Please pay to share contact details.',
    };
  }

  if (is_phone_detect().test(msg)) {
    return {
      valid: false,
      error: 'Sharing phone is not allowed. Please pay to share contact details.',
    };
  }
  return {
    valid: true,
    error: '',
  };
}

export { remove_bad_words, is_phone_detect, is_valid_msg };
