import React, { useState, useEffect } from "react";
import fapshiAPI from "./api/Payment";
import "bootstrap/dist/css/bootstrap.min.css";

export default function InitiatePayment() {
  const [amount, setAmount] = useState("");
  const [redirectUrl, setRedirectUrl] = useState(" https://live.fapshi.com");
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (responseMessage) {
      const timer = setTimeout(() => {
        setResponseMessage(null);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const paymentData = {
      amount: parseInt(amount),
      redirect_url: redirectUrl,
      name: "John Doe",
      email: "john.doe@example.com",
      userId: "12345",
      externalId: "12345",
      message: "Payment initiation test",
    };

    try {
      const response = await fapshiAPI.initiatePay(paymentData);
      setResponseMessage(response?.message || "Payment initiation successful.");
    } catch (error) {
      setResponseMessage("Payment initiation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm">
        <h3 className="text-center mb-3">Initiate Payment</h3>
        <form onSubmit={handleInitiatePayment}>
          <div className="mb-3">
            <label className="form-label">Amount (XAF)</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Redirect URL</label>
            <input
              type="text"
              className="form-control"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Processing..." : "Initiate Payment"}
          </button>
        </form>

        {/* Show Loading Indicator */}
        {loading && (
          <div className="mt-3 alert alert-warning text-center">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></div>
            Processing payment...
          </div>
        )}

        {/* Response Messages (Auto-disappears after 30 sec) */}
        {responseMessage && (
          <div className="mt-3 alert alert-info text-center">
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
}
