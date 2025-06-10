/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import React, { useEffect, useState } from "react";
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
import { AxiosError, isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Save, Trash } from "lucide-react";
import MultipleSelector, { Option } from "./ui/multi-select";
import api from "@/lib/axios";
import { Switch } from "./ui/switch";

interface DailyPatientMealFormProps {
  currentDate: Date;
  roomTypeID: number;
  roomTypes: RoomType[];
  mealTypes: MealType[];
  diets: Diet[];
  allergies: Allergy[];
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
  roomTypeID: z.number({ message: "Silahkan pilih Jenis Kamar" }),
  roomID: z.number({ message: "Silahkan pilih Nomor Kamar" }),
  mealTypeID: z.number({ message: "Silahkan pilih Jenis Makanan" }),
  notes: z.string(),
  dietIDs: z.array(z.number()),
  allergyIDs: z.array(z.number()),
  isNewlyAdmitted: z.boolean(),
});

const DailyPatientMealForm = ({
  currentDate,
  roomTypeID,
  roomTypes,
  mealTypes,
  diets,
  allergies,
  initialData,
  onSuccess,
  className,
}: DailyPatientMealFormProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const form = useForm({
    defaultValues: {
      patientID: initialData?.patientID ?? 0,
      patientMedicalRecordNumber:
        initialData?.patient.medicalRecordNumber ?? "",
      patientName: initialData?.patient.name ?? "",
      roomTypeID: initialData?.room.roomTypeID ?? roomTypeID,
      roomID: initialData?.roomID ?? "",
      mealTypeID: initialData?.mealTypeID ?? "",
      notes: initialData?.notes ?? "",
      dietIDs: initialData?.diets.map((diet) => diet.id) ?? [],
      allergyIDs:
        initialData?.patient.allergies.map((allergy) => allergy.id) ?? [],
      isNewlyAdmitted: initialData?.isNewlyAdmitted ?? false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (isPatientNotExists) return;

      const payload = {
        patientID: value.patientID,
        roomID: value.roomID,
        mealTypeID: value.mealTypeID,
        date: initialData?.createdAt ?? currentDate,
        notes: value.notes,
        dietIDs: value.dietIDs,
        isNewlyAdmitted: value.isNewlyAdmitted,
      };
      try {
        const url = initialData
          ? `/daily-patient-meal/${initialData.id}`
          : `/daily-patient-meal`;

        const method = initialData ? "patch" : "post";

        await api[method](url, payload);
        toast.success(
          `Berhasil ${initialData ? "mengubah" : "menambahkan"} data`,
        );
        onSuccess();
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(String(err.response?.data.error));
        }
      }
    },
  });

  const onDelete = async (id: number) => {
    try {
      const res = await api.delete(`/daily-patient-meal/${id}`);
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

  const [selectedRoomTypeID, setSelectedRoomTypeID] = useState<number>(
    form.getFieldValue("roomTypeID"),
  );
  useEffect(() => {
    if (!selectedRoomTypeID) return;
    const fetchRoomsBasedOnRoomType = async () => {
      const res = await api.get(`/room/filter?roomType=${selectedRoomTypeID}`);
      setRooms(res.data.data as Room[]);
    };

    fetchRoomsBasedOnRoomType();
  }, [selectedRoomTypeID]);

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
      const res = await api.get(`/patient/filter?mrn=${medicalRecordNumber}`);
      const data = res.data.data as Patient;
      console.log(data);
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
      className={cn("text-md", className)}
      autoComplete="off"
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

      <div className="grid grid-cols-4 grid-rows-8 items-center gap-4">
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
          <Label htmlFor="roomID">Tipe Kamar</Label>
        </div>
        <div className="col-span-3 row-start-3 max-h-[40px]">
          <form.Field name="roomTypeID">
            {(field) => (
              <Select
                value={field.state.value?.toString()}
                onValueChange={(val) => {
                  setSelectedRoomTypeID(Number(val));
                  field.handleChange(Number(val));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Jenis kamar" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((roomType) => (
                    <SelectItem
                      key={roomType.id}
                      value={roomType.id.toString()}
                    >
                      {roomType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </form.Field>
        </div>

        <div className="row-start-4">
          <Label htmlFor="roomID">Nomor Kamar</Label>
        </div>
        <div className="col-span-3 row-start-4 max-h-[40px]">
          <form.Field name="roomID">
            {(field) =>
              initialData ? (
                <Select
                  value={field.state.value?.toString()}
                  onValueChange={(val) => field.handleChange(Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Nomor Kamar" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name} ({room.treatmentClass})
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nomor Kamar" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name} ({room.treatmentClass})
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
          <Label htmlFor="mealTypeID">Jenis Makanan</Label>
        </div>
        <div className="col-span-3 row-start-5 max-h-[40px]">
          <form.Field name="mealTypeID">
            {(field) =>
              initialData ? (
                <Select
                  value={field.state.value?.toString()}
                  onValueChange={(val) => field.handleChange(Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((mt) => (
                      <SelectItem key={mt.id} value={mt.id.toString()}>
                        {mt.code}
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Jenis makanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((mt) => (
                        <SelectItem key={mt.id} value={mt.id.toString()}>
                          {mt.code}
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

        <div className="row-start-6">
          <Label htmlFor="notes">Diet</Label>
        </div>
        <div className="col-span-3 row-start-6 max-h-[45px]">
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

        <div className="row-start-7">
          <Label htmlFor="notes">Catatan</Label>
        </div>
        <div className="col-span-3 row-start-7">
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

        <div className="row-start-8">
          <Label htmlFor="notes">Pasien tambahan?</Label>
        </div>
        <div className="col-span-3 row-start-8">
          <form.Field name="isNewlyAdmitted">
            {(field) => (
              <Switch
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
            )}
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
