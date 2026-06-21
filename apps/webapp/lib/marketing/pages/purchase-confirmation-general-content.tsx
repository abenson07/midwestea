export const purchaseConfirmationGeneralSections = [
  {
    type: "component" as const,
    component: "Header 64" as const,
    props: {
      heading: "Order confrimed",
      description: (
        <>
          We&apos;ve received your order. We&apos;ll be in touch with next steps. If you do not
          hear from us within 2 business days, please reach out to us at{" "}
          <a href="mailto:kbrower@midwestea.com">kbrower@midwestea.com</a>.
        </>
      ),
    },
  },
];
