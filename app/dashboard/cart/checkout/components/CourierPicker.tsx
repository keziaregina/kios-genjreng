"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURIERS, findCourier } from "@/lib/checkout";
import { formatPrice } from "@/lib/utils";

type CourierPickerProps = {
  value: string;
  onChange: (courierId: string) => void;
  disabled: boolean;
};

const CourierPicker = ({ value, onChange, disabled }: CourierPickerProps) => {
  const courier = findCourier(value);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-button-primary text-xs font-semibold">Pilihan Pengiriman</p>

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label="Pilih kurir">
          <SelectValue placeholder="Pilih kurir" />
        </SelectTrigger>
        <SelectContent>
          {COURIERS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name} · {formatPrice(option.cost)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {courier && (
        <p className="text-text-secondary text-xs">
          Pengiriman tercepat dan teraman. {courier.eta}.
        </p>
      )}
    </div>
  );
};

export default CourierPicker;
