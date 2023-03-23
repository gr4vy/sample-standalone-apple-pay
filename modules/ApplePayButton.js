const ApplePayButton = ({ config, onVerify, onSuccess }) => {
  const onClick = async () => {
    const session = new ApplePaySession(3, {
      countryCode: config.country,
      currencyCode: config.currency,
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard", "amex", "discover"],
      total: {
        label: "Demo (Card is not charged)",
        type: "final",
        amount: config.amount.toString(),
      },
    });
  
    session.onvalidatemerchant = async (event) => {
      const merchantSession = await onVerify({
        validation_url: event.validationURL,
        domain_name: document.location.hostname,
      });
      session.completeMerchantValidation(merchantSession);
    };

    session.onpaymentauthorized = (event) => {
      session.completePayment({
        status: ApplePaySession.STATUS_SUCCESS,
      });
      onSuccess(event.payment.token);
    };

    session.begin();
  };

  return <div className={"apple-pay-button"} onClick={onClick} />;
};

export default ApplePayButton;
