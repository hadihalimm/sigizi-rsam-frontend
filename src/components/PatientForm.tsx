import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import React, { useEffect } from "react";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save, Trash } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { DateTimePicker } from "./ui/datetime-picker";

interface PatientFormProps {
  initialData?: Patient;
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  medicalRecordNumber: z
    .string()
    .min(1, { message: "Silahkan masukkan No. MR" }),
  patientName: z.string().min(1, { message: "Silahkan masukkan nama pasien" }),
  dateOfBirth: z.date(),
});

const PatientForm = ({
  initialData,
  onSuccess,
  className,
}: PatientFormProps) => {
  useEffect(() => {}, []);

  const form = useForm({
    defaultValues: {
      medicalRecordNumber: initialData?.medicalRecordNumber ?? "",
      patientName: initialData?.name ?? "",
      dateOfBirth: initialData?.dateOfBirth ?? new Date(),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const payload = {
        medicalRecordNumber: value.medicalRecordNumber,
        name: value.patientName,
        dateOfBirth: `${new Date(value.dateOfBirth).toISOString()}`,
      };
      console.log(payload);
      try {
        const url = initialData
          ? `${baseUrl}/patient/${initialData.id}`
          : `${baseUrl}/patient`;
        const method = initialData ? "patch" : "post";

        const res = await axios[method](url, payload);
        console.log(res.status);
        onSuccess();
        toast.success(
          `Berhasil ${initialData ? "mengubah" : "menambahkan"} data`,
        );
      } catch (err) {
        console.error(err);
        toast.error(String(err));
      }
    },
  });

  const onDelete = async (id: number) => {
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/patient/${id}`,
      );
      console.log(res.status);
      toast.success("Berhasil menghapus data pasien");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(String(err));
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("", className)}
    >
      <div className="grid grid-cols-4 grid-rows-3 items-center gap-4 gap-x-2">
        <div>
          <Label htmlFor="medicalRecordNumber">Nomor MR</Label>
        </div>
        <div className="col-span-3 max-h-[40px]">
          <form.Field name="medicalRecordNumber">
            {(field) =>
              initialData ? (
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="medicalRecordNumber"
                  disabled
                />
              ) : (
                <div>
                  <Input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="medicalRecordNumber"
                  />
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

        <div className="row-start-2">
          <Label htmlFor="patientName">Nama pasien</Label>
        </div>
        <div className="col-span-3 row-start-2">
          <form.Field name="patientName">
            {(field) => (
              <div>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="patientName"
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.errors.map((err, idx) => (
                    <p key={idx} className="text-[10px] text-red-500">
                      {err?.message}
                    </p>
                  ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="row-start-3">
          <Label htmlFor="dateOfBirth">Tanggal lahir</Label>
        </div>
        <div className="col-span-3 row-start-3">
          <form.Field name="dateOfBirth">
            {(field) => (
              <div>
                <DateTimePicker
                  granularity="day"
                  value={new Date(field.state.value)}
                  onChange={(date) => {
                    if (date) {
                      field.handleChange(date);
                    }
                  }}
                />
              </div>
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

export default PatientForm;
