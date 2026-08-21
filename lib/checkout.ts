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

export const DEFAULT_COURIER_ID = COURIERS[0].id;

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
}) {
  return costs.subtotal + costs.shippingCost + costs.protectionFee;
}
