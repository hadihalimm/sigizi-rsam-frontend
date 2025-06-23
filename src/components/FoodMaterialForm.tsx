import { useForm } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

interface FoodMaterialFormProps {
  initialData?: FoodMaterial;
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Silahkan masukkan nama bahan makanan" }),
  unit: z.string().min(1, { message: "Silahkan masukkan satuan" }),
  standardPerMeal: z.coerce
    .number()
    .positive({ message: "Harus lebih dari 0" }),
});

const FoodMaterialForm = ({
  initialData,
  onSuccess,
  className,
}: FoodMaterialFormProps) => {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      unit: initialData?.unit ?? "",
      standardPerMeal: initialData?.standardPerMeal ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        unit: value.unit,
        standardPerMeal: Number(value.standardPerMeal),
      };
      console.log(value);

      try {
        const url = initialData
          ? `/admin/food-material/${initialData.id}`
          : `/admin/food-material`;
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
      const res = await api.delete(`/admin/food-material/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus data bahan makanan");
      onSuccess();
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
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
          <Label htmlFor="name">Nama Bahan</Label>
        </div>
        <div className="col-span-3 max-h-[40px]">
          <form.Field name="name">
            {(field) => (
              <div>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="name"
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

        <div className="row-start-2">
          <Label htmlFor="unit">Satuan</Label>
        </div>
        <div className="col-span-3 row-start-2">
          <form.Field name="unit">
            {(field) => (
              <div>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="unit"
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
          <Label htmlFor="standardPerMeal">Standar</Label>
        </div>
        <div className="col-span-3 row-start-3">
          <form.Field name="standardPerMeal">
            {(field) => {
              return (
                <div>
                  <Input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="standardPerMeal"
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.errors.map((err, idx) => (
                      <p key={idx} className="text-[10px] text-red-500">
                        {err?.message}
                      </p>
                    ))}
                </div>
              );
            }}
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

export default FoodMaterialForm;
