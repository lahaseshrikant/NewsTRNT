import { redirect } from 'next/navigation';

export default function MarketConfigIndex() {
  // Redirect to the primary market-config subpage
  redirect('/market-config/indices');
}
