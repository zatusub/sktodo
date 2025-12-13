// Stripe SDKはBackendがない環境での直接実行が廃止されたため、Payment Linkを使用します
import './MoneyPage.css';

const MoneyPage = () => {
  const handlePayment = () => {
    // Payment Linkの取得
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

    if (!paymentLink) {
      alert('Payment Link Missing! \nPlease set VITE_STRIPE_PAYMENT_LINK in .env file.');
      return;
    }

    // 単純なリダイレクト
    window.location.href = paymentLink;
  };

  return (
    <div className="money-page-container">
      <div className="money-title">Premium Access</div>
      <div className="money-subtitle">Unleash the Power of GOLD</div>

      <div className="premium-card">
        <h2 style={{ fontSize: '2rem', margin: '0 0 20px 0', color: '#B8860B' }}>
          LIFETIME PLAN
        </h2>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', margin: '20px 0', color: '#3e2723' }}>
          ¥100
        </div>
        <p style={{ marginBottom: '30px', fontSize: '1.2rem' }}>
          Become a legend. Own the calendar. Destroy tasks in luxury.
        </p>

        <button className="pay-button" onClick={handlePayment}>
          PAY NOW
        </button>

        <p className="disclaimer">
          * This uses Stripe Payment Links.
          <br />
          Secure, fast, and legendary.
        </p>
      </div>
    </div>
  );
};

export default MoneyPage;
