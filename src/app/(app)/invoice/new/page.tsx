import { Suspense } from 'react';
import { InvoiceForm } from './invoice-form';

export default function NewInvoicePage() {
  return (
    <Suspense>
      <InvoiceForm />
    </Suspense>
  );
}