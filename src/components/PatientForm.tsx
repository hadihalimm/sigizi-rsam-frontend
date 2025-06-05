import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save, Trash } from "lucide-react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { DateTimePicker } from "./ui/datetime-picker";
import MultipleSelector, { Option } from "./ui/multi-select";
import { useState } from "react";
import api from "@/lib/axios";

interface PatientFormProps {
  initialData?: Patient;
  allergies: Allergy[];
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  medicalRecordNumber: z
    .string()
    .min(1, { message: "Silahkan masukkan No. MR" }),
  patientName: z.string().min(1, { message: "Silahkan masukkan nama pasien" }),
  dateOfBirth: z.date(),
  allergyIDs: z.array(z.number()),
});

const PatientForm = ({
  initialData,
  allergies,
  onSuccess,
  className,
}: PatientFormProps) => {
  const form = useForm({
    defaultValues: {
      medicalRecordNumber: initialData?.medicalRecordNumber ?? "",
      patientName: initialData?.name ?? "",
      dateOfBirth: initialData?.dateOfBirth
        ? new Date(initialData.dateOfBirth)
        : new Date(),
      allergyIDs: initialData?.allergies.map((allergy) => allergy.id) ?? [],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        medicalRecordNumber: value.medicalRecordNumber,
        name: value.patientName,
        dateOfBirth: value.dateOfBirth.toISOString(),
        allergyIDs: value.allergyIDs,
      };
      try {
        const url = initialData ? `/patient/${initialData.id}` : `/patient`;
        const method = initialData ? "patch" : "post";

        const res = await api[method](url, payload);
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
      const res = await api.delete(`/patient/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus data pasien");
      onSuccess();
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const allergyOptions: Option[] = allergies.map((allergy) => ({
    label: allergy.code,
    value: allergy.id.toString(),
  }));
  const [choosenAllergy, setChoosenAllergy] = useState<Option[]>(
    initialData?.allergies.map((allergy) => ({
      label: allergy.code,
      value: allergy.id.toString(),
    })) ?? [],
  );
  const handleAllergyChange = (selected: Option[]) => {
    form.setFieldValue(
      "allergyIDs",
      selected.map((option) => Number(option.value)),
    );
    setChoosenAllergy(selected);
  };

  return (
    <form
      onSubmit={async (e) => {
        console.log(form.getFieldValue("dateOfBirth"));
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("", className)}
    >
      <div className="grid grid-cols-4 grid-rows-4 items-center gap-4 gap-x-2">
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
                    placeholder="Nomor MR"
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
                  placeholder="Nama pasien"
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
                  value={field.state.value}
                  onChange={(date) => {
                    if (date) {
                      field.handleChange(date);
                    }
                  }}
                  yearRange={100}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="row-start-4">
          <Label htmlFor="allergy">Alergi</Label>
        </div>
        <div className="col-span-3 row-start-4 max-h-[45px]">
          <form.Field name="allergyIDs">
            {() => (
              <div>
                <MultipleSelector
                  value={choosenAllergy}
                  onChange={handleAllergyChange}
                  defaultOptions={allergyOptions}
                  placeholder="Pilih alergi pasien..."
                  hidePlaceholderWhenSelected
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
