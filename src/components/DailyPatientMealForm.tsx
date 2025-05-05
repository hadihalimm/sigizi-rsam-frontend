import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import React, { useState } from "react";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import axios, { AxiosError, isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Save, Trash } from "lucide-react";
import MultipleSelector, { Option } from "./ui/multi-select";

interface DailyPatientMealFormProps {
  rooms: Room[];
  mealTypes: MealType[];
  diets: Diet[];
  initialData?: DailyPatientMeal;
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  patientID: z.number(),
  patientMedicalRecordNumber: z
    .string()
    .min(1, { message: "Silahkan masukkan Nomor MR" }),
  patientName: z.string(),
  roomID: z.number({ message: "Silahkan pilih Nomor Kamar" }),
  mealTypeID: z.number({ message: "Silahkan pilih Jenis Makanan" }),
  notes: z.string(),
  dietIDs: z.array(z.number()),
});

const DailyPatientMealForm = ({
  rooms,
  mealTypes,
  diets,
  initialData,
  onSuccess,
  className,
}: DailyPatientMealFormProps) => {
  const form = useForm({
    defaultValues: {
      patientID: initialData?.patientID ?? 0,
      patientMedicalRecordNumber:
        initialData?.patient.medicalRecordNumber ?? "",
      patientName: initialData?.patient.name ?? "",
      roomID: initialData?.roomID ?? "",
      mealTypeID: initialData?.mealTypeID ?? "",
      notes: initialData?.notes ?? "",
      dietIDs: initialData?.diets.map((diet) => diet.id) ?? [],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (isPatientNotExists) return;

      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const payload = {
        patientID: value.patientID,
        roomID: value.roomID,
        mealTypeID: value.mealTypeID,
        date: initialData?.createdAt.toISOString() ?? new Date().toISOString(),
        notes: value.notes,
        dietIDs: value.dietIDs,
      };
      try {
        const url = initialData
          ? `${baseUrl}/daily-patient-meal/${initialData.id}`
          : `${baseUrl}/daily-patient-meal`;

        const method = initialData ? "patch" : "post";

        const res = await axios[method](url, payload);
        console.log(res.status);
        onSuccess();
        toast.success(
          `Berhasil ${initialData ? "mengubah" : "menambahkan"} data`,
        );
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err.response?.data.error));
        }
        console.error(err);
      }
    },
  });

  const onDelete = async (id: number) => {
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/daily-patient-meal/${id}`,
      );
      console.log(res.status);
      toast.success("Berhasil menghapus data");
      onSuccess();
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const dietOptions: Option[] = diets.map((diet) => ({
    label: diet.code,
    value: diet.id.toString(),
  }));
  const [choosenDiet, setChoosenDiet] = useState<Option[]>(
    initialData?.diets.map((diet) => ({
      label: diet.code,
      value: diet.id.toString(),
    })) ?? [],
  );
  const handleDietChange = (selected: Option[]) => {
    form.setFieldValue(
      "dietIDs",
      selected.map((option) => Number(option.value)),
    );
    setChoosenDiet(selected);
  };

  const [isPatientNotExists, setIsPatientNotExists] = useState(false);
  const checkPatientExists = async (medicalRecordNumber: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/patient/filter?mrn=${medicalRecordNumber}`,
      );
      const data = res.data.data as Patient;
      form.setFieldValue("patientID", data.id);
      form.setFieldValue("patientName", data.name);
      setIsPatientNotExists(false);
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.code === AxiosError.ERR_NETWORK) {
          toast.error(String(err.response?.data.error));
          return;
        }
        toast.error(String(err.response?.data.error));
      }
      setIsPatientNotExists(true);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("", className)}
    >
      <Label htmlFor="patientID"></Label>
      <form.Field name="patientID">
        {(field) =>
          initialData ? (
            <Input type="hidden" value={field.state.value} disabled />
          ) : (
            <Input type="hidden" value={field.state.value} />
          )
        }
      </form.Field>

      <div className="grid grid-cols-4 grid-rows-6 items-center gap-4">
        <div>
          <Label htmlFor="patientMedicalRecordNumber">Nomor MR</Label>
        </div>
        <div className="col-span-3 max-h-[40px]">
          <form.Field name="patientMedicalRecordNumber">
            {(field) =>
              initialData ? (
                <p id="patientMedicalRecordNumber">{field.state.value}</p>
              ) : (
                <div>
                  <div className="flex gap-x-2">
                    <Input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      id="patientMedicalRecordNumber"
                    />
                    <Button
                      type="button"
                      onClick={() => checkPatientExists(field.state.value)}
                    >
                      Cek No. MR
                    </Button>
                  </div>
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.errors.map((err, idx) => (
                      <p key={idx} className="text-[10px] text-red-500">
                        {err?.message}
                      </p>
                    ))}
                  {isPatientNotExists && (
                    <p className="text-[10px] text-red-500">
                      Pasien tidak ditemukan
                    </p>
                  )}
                </div>
              )
            }
          </form.Field>
        </div>

        <div className="row-start-2">
          <Label htmlFor="patientName">Nama pasien</Label>
        </div>
        <div className="rows-start-2 col-span-3">
          <form.Field name="patientName">
            {(field) =>
              initialData ? (
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="patientName"
                  disabled
                />
              ) : (
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="patientName"
                  disabled
                />
              )
            }
          </form.Field>
        </div>

        <div className="row-start-3">
          <Label htmlFor="roomID">Nomor Kamar</Label>
        </div>
        <div className="col-span-3 row-start-3 max-h-[40px]">
          <form.Field name="roomID">
            {(field) =>
              initialData ? (
                <Select
                  value={field.state.value?.toString()}
                  onValueChange={(val) => field.handleChange(Number(val))}
                >
                  <SelectTrigger className="w-1/2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Select
                    value={field.state.value?.toString()}
                    onValueChange={(val) => field.handleChange(Number(val))}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Nomor Kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.roomNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.errors.map((err, idx) => (
                      <p key={idx} className="text-[10px] text-red-500">
                        {err?.message}
                      </p>
                    ))}
                </div>
              )
            }
          </form.Field>
        </div>

        <div className="row-start-4">
          <Label htmlFor="mealTypeID">Jenis Makanan</Label>
        </div>
        <div className="col-span-3 row-start-4 max-h-[40px]">
          <form.Field name="mealTypeID">
            {(field) =>
              initialData ? (
                <Select
                  value={field.state.value?.toString()}
                  onValueChange={(val) => field.handleChange(Number(val))}
                >
                  <SelectTrigger className="w-1/2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((mt) => (
                      <SelectItem key={mt.id} value={mt.id.toString()}>
                        {mt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Select
                    value={field.state.value?.toString()}
                    onValueChange={(val) => field.handleChange(Number(val))}
                  >
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Jenis makanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((mt) => (
                        <SelectItem key={mt.id} value={mt.id.toString()}>
                          {mt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.errors.map((err, idx) => (
                      <p key={idx} className="text-[10px] text-red-500">
                        {err?.message}
                      </p>
                    ))}
                </div>
              )
            }
          </form.Field>
        </div>

        <div className="row-start-5">
          <Label htmlFor="notes">Diet</Label>
        </div>
        <div className="col-span-3 row-start-5 max-h-[45px]">
          <form.Field name="dietIDs">
            {() => (
              <div>
                <MultipleSelector
                  value={choosenDiet}
                  onChange={handleDietChange}
                  defaultOptions={dietOptions}
                  placeholder="Pilih diet pasien..."
                  hidePlaceholderWhenSelected
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="row-start-6">
          <Label htmlFor="notes">Catatan</Label>
        </div>
        <div className="col-span-3 row-start-6">
          <form.Field name="notes">
            {(field) =>
              initialData ? (
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="notes"
                />
              ) : (
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="notes"
                />
              )
            }
          </form.Field>
        </div>
      </div>

      {initialData ? (
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            className=""
            variant="destructive"
            onClick={() => {
              onDelete(initialData.id);
            }}
          >
            <Trash />
            Hapus
          </Button>
          <Button type="submit" className="">
            <Save />
            Simpan
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex justify-end">
          <Button type="submit" className="">
            <Save />
            Simpan
          </Button>
        </div>
      )}
    </form>
  );
};

export default DailyPatientMealForm;
