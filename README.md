# Sample: Standalone Apple Pay on web

## Testing the sample

To run this sample please perform the following steps.

<details>

<summary>Instructions</summary>

### Preparation

- Create an API key in your Gr4vy dashboard and save it as `./private_key.pem`
- Follow the Apple Pay [**Sandbox Testing**](https://developer.apple.com/apple-pay/sandbox-testing/) instructions.
  - Create an Apple test account
  - Add the test account to your Apple device
  - Add a test card to your Apple device
- Install Node `v18` or above as well asthe dependencies for this project
  - Run `npm install`
- Start the server with `npm run dev`

### Running on HTTPS

Next, it's important to run the sample on HTTPs. We recommend using a free tool like [Ngrok](https://ngrok.com).

- Expose your site over HTTPs with `ngrok`
  - Run `ngrok http 3000`
  - This exposes your site on an Ngrok domain, for example `https://40be-88-97-18-163.ngrok.io`
- Enable the Ngrok domain for Apple Pay
  - Visit your Gr4vy dashboard
  - Go to **Connections** -> **Apple Pay**
  - Add the Ngrok domain to the list of domain names
  - Save the form

### Test a payment

Finally, it's time to test a payment.

- Ensure you have a connector set up for the currency and amount, and that it supports Apple Pay
- Open the Ngrok domain in Safari on a Mac or other Apple device

</details>

## How it works

Using Apple Pay without Embed on web involves the following steps.

### Render an Apple Pay button

An Apple Pay button can be displayed and customized [with some simple css](https://developer.apple.com/documentation/apple_pay_on_the_web/displaying_apple_pay_buttons_using_css).

```html
<style>
  .button {
    display: inline-block;
    -webkit-appearance: -apple-pay-button;
    -apple-pay-button-type: pay;
    cursor: pointer;
  }
</style>

<button class="button"></button>
```

### Handle button click

When a button is clicked, start an [Apple Pay Session](https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/creating_an_apple_pay_session).

```js
  const onClick = async () => {
    const session = new ApplePaySession(3, {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard", "amex", "discover"],
      total: {
        label: "Demo (Card is not charged)",
        type: "final",
        amount: '12.99',
      },
    });

    ...

    session.begin();
  };
```

### Verify session

Next, make an API call to Gr4vy to verify the merchant is allowed to accept Apple Pay with Gr4vy on this domain.

> **Note:** This is why it's important to register the domain for Apple Pay in the Gr4vy dashboard.

```js
...
async (verificationData) => {

  };

session.onvalidatemerchant = async (event) => {
  const response = await fetch(`http://api.sandbox.example.gr4vy.app/digital-wallets/apple/session`, {
    method: "POST",
    headers: {
      "Authorization": `bearer [JWT]`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      validation_url: event.validationURL,
      domain_name: document.location.hostname,
    }),
  });
  const merchantSession = await response.json();
  session.completeMerchantValidation(merchantSession);
};

session.begin();
```

### Create a transaction

Finally, once the Apple Pay transaction has been authorized by Apple, create a transaction with Gr4vy.

```js
import snakeCaseKeys from "snakecase-keys";

...

session.onpaymentauthorized = (event) => {
  await fetch(`http://api.sandbox.example.gr4vy.app/transactions`, {
    method: "POST",
    headers: {
      "Authorization": `bearer [JWT]`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 1299,
      currency: "US",
      country: "USD",
      payment_method: {
        method: "applepay",
        // The Gr4vy API expects the Apple Pay token to 
        // use snake_case keys
        token: snakeCaseKeys(event.payment.token),
      },
    }),
  });
  

  session.completePayment({
    status: ApplePaySession.STATUS_SUCCESS,
  });
};

session.begin();
```
