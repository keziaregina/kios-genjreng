export const MAX_ADDRESSES = 10;
export const MAX_ADDRESS_NOTE_LENGTH = 120;

export type AddressFieldKey =
  | "label"
  | "recipient"
  | "phone"
  | "street"
  | "village"
  | "district"
  | "city"
  | "postalCode";

export type AddressField = {
  key: AddressFieldKey;
  label: string;
  max: number;
  placeholder: string;
  multiline?: boolean;
};

// The form renders from this table and the server validates against it, so a field cannot exist unchecked.
export const ADDRESS_FIELDS: AddressField[] = [
  { key: "label", label: "Label alamat", max: 40, placeholder: "Rumah, Kantor" },
  { key: "recipient", label: "Nama penerima", max: 60, placeholder: "Nama lengkap" },
  { key: "phone", label: "Nomor telepon", max: 20, placeholder: "08xxxxxxxxxx" },
  {
    key: "street",
    label: "Alamat lengkap",
    max: 200,
    placeholder: "Nama jalan, nomor rumah, RT/RW",
    multiline: true,
  },
  { key: "village", label: "Kelurahan", max: 60, placeholder: "Kelurahan" },
  { key: "district", label: "Kecamatan", max: 60, placeholder: "Kecamatan" },
  { key: "city", label: "Kota", max: 60, placeholder: "Kota atau kabupaten" },
  { key: "postalCode", label: "Kode pos", max: 10, placeholder: "12345" },
];

// The card, the picker and the order snapshot all quote an address the same way.
export function formatAddress(address: {
  street: string;
  village: string;
  district: string;
  city: string;
  postalCode: string;
}) {
  return `${address.street}, Kel. ${address.village}, Kec. ${address.district}, ${address.city} ${address.postalCode}`;
}
