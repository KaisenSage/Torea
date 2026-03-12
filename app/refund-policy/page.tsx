import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Refund & Return Policy</h1>
      <p>Welcome to Toréa. We value your trust and strive to deliver high-quality fashion pieces that meet our brand standards. If for any reason you are not completely satisfied with your purchase, our return policy allows you to request a return under the conditions outlined below.</p>
      <h2 className="mt-8 text-2xl font-semibold">1. Return Window</h2>
      <p>Customers may request a return within 24 hours of receiving their order. Any request made after the 24-hour period may not be eligible for a return or refund.</p>
      <h2 className="mt-8 text-2xl font-semibold">2. Condition of Returned Items</h2>
      <p>To qualify for a return, items must meet the following conditions:</p>
      <ul className="list-disc ml-6">
        <li>The product must be returned in the same condition it was delivered.</li>
        <li>Items must not be worn, washed, altered, or damaged by the customer.</li>
        <li>The product should be returned with all original packaging and tags if applicable.</li>
        <li>Toréa reserves the right to decline returns that do not meet these conditions.</li>
      </ul>
      <h2 className="mt-8 text-2xl font-semibold">3. Faulty or Defective Products</h2>
      <p>If the item you received has a manufacturing defect or quality issue caused by the brand, you are eligible for a return or replacement. Examples include:</p>
      <ul className="list-disc ml-6">
        <li>Stitching defects</li>
        <li>Fabric damage present at delivery</li>
        <li>Incorrect item sent</li>
      </ul>
      <p>In such cases, customers should contact our support team within the 24-hour return window with clear photos of the issue.</p>
      <h2 className="mt-8 text-2xl font-semibold">4. Return Approval Process</h2>
      <p>To initiate a return:</p>
      <ul className="list-decimal ml-6">
        <li>Contact our customer support team within 24 hours of delivery.</li>
        <li>Provide your order number and a brief description of the issue.</li>
        <li>If the return request is approved, you will receive instructions on how to return the item.</li>
      </ul>
      <p>Items returned without prior approval may not be accepted.</p>
      <h2 className="mt-8 text-2xl font-semibold">5. Refunds</h2>
      <p>Once the returned item is received and inspected:</p>
      <ul className="list-disc ml-6">
        <li>If the return meets our policy conditions, a refund or replacement will be processed.</li>
        <li>Refunds will be issued using the original payment method used during checkout.</li>
        <li>Processing times may vary depending on your payment provider.</li>
      </ul>
      <h2 className="mt-8 text-2xl font-semibold">6. Non-Returnable Situations</h2>
      <p>Returns may not be accepted if:</p>
      <ul className="list-disc ml-6">
        <li>The request is made after the 24-hour return window.</li>
        <li>The item shows signs of wear, washing, or damage caused by the customer.</li>
        <li>The item is not returned in the same condition it was delivered.</li>
      </ul>
      <h2 className="mt-8 text-2xl font-semibold">7. Contact Us</h2>
      <p>For all return and refund inquiries, please contact our support team with your order details. We aim to respond as quickly as possible to assist you.</p>
    </div>
  );
}
