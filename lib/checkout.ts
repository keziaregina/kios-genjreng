export const PROTECTION_FEE = 5000;
export const PROTECTION_LABEL = "Tambah perlindungan ekstra";
export const PROTECTION_DESCRIPTION =
  "Melindungi barang dari kerusakan atau kerugian selama 3 bulan";
export const MAX_NOTE_LENGTH = 200;

export type Courier = {
  id: string;
  name: string;
  cost: number;
  eta: string;
};

// The checkout form and the server both read this table so a quoted tariff can never differ from the charged one.
export const COURIERS: Courier[] = [
  { id: "jck", name: "J&ck", cost: 50000, eta: "Paket akan tiba dalam 2 jam" },
  { id: "sicepat", name: "SiCepat", cost: 25000, eta: "Paket akan tiba dalam 1 hari" },
  { id: "pos", name: "Pos Kios", cost: 12000, eta: "Paket akan tiba dalam 3 hari" },
];

export const CHEAPEST_COURIER = COURIERS.reduce((low, courier) =>
  courier.cost < low.cost ? courier : low,
);

// Checkout opens on the same courier the cart quoted, so the total never jumps between the two screens.
export const DEFAULT_COURIER_ID = CHEAPEST_COURIER.id;

// The cart quotes shipping before a courier is picked, so it shows the floor price the buyer can still get.
export function shippingEstimate(merchantCount: number) {
  return CHEAPEST_COURIER.cost * merchantCount;
}

export function findCourier(id: string): Courier | undefined {
  return COURIERS.find((courier) => courier.id === id);
}

export function protectionFee(protection: boolean) {
  return protection ? PROTECTION_FEE : 0;
}

export function orderTotal(costs: {
  subtotal: number;
  shippingCost: number;
  protectionFee: number;
  discount: number;
}) {
  return Math.max(
    0,
    costs.subtotal + costs.shippingCost + costs.protectionFee - costs.discount,
  );
}
