import Head from "next/head";

import { useEffect, useState } from "react";
import ApplePayButton from "@/modules/ApplePayButton";
import snakeCaseKeys from "snakecase-keys";

const config = {
  amount: 12.99,
  country: "US",
  currency: "USD",
  base_url: "https://api.sandbox.spider.gr4vy.app",
};

const Home = () => {
  // Fetch an API token server side
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch(`/api/token?${new URLSearchParams(config)}`);
      const data = await response.json();
      return data.token;
    };

    fetchToken().then((token) => setToken(token));
  }, []);

  // Verify Apple Pay can be used on this domain
  const onVerify = async (verificationData) => {
    const response = await fetch(`${config.base_url}/digital-wallets/apple/session`, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationData),
    });
    return response.json();
  };

  // Create an apple pay transaction
  const onSuccess = async (applePayToken) => {
    await fetch(`${config.base_url}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: config.amount*100,
        currency: config.currency,
        country: config.country,
        payment_method: {
          method: "applepay",
          // The Gr4vy API expects the Apple Pay token to use snake_case keys
          token: snakeCaseKeys(applePayToken),
        },
      }),
    });
    
    alert('Transaction successful!')
  };

  return (
    <>
      <Head>
        <title>Sample</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {token && (
          <ApplePayButton
            config={config}
            onVerify={onVerify}
            onSuccess={onSuccess}
          />
        )}
      </main>
    </>
  );
};

export default Home;
