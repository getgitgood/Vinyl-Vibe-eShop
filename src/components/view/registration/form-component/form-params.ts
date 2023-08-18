const formParams = {
  form: {
    tag: 'form',
    cssClasses: ['reg-form'],
  },

  heading: {
    tag: 'h4',
    cssClasses: ['adrs-wrapper__hdn'],
    shipping: {
      text: 'Shipping Address',
    },
    billing: {
      text: 'Billing Address',
    },
  },

  addressDiv: {
    cssClasses: ['adrs-wrapper'],
  },

  button: {
    tag: 'button',
    cssClasses: ['reg-form__btn'],
    type: 'submit',
    textContent: 'Sign Up',
  },

  fieldset: {
    noDisplay: ['no-display'],
    showDisplay: ['show-display'],
  },
  signUpMessage: 'Account has been created successfully!',
  errorLoginMessage: 'Login attempt has failed. Please go to the login page and try again',
  errorSignUpMessage: 'Please check your information and try again',
  serverProblemMessage: 'Please check your connection and try again',
};

export default formParams;
