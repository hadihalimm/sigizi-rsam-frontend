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

interface FoodFormProps {
  initialData?: Food;
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: " Silahkan masukkan Nama Makanan" }),
  unit: z.string().min(1, { message: " Silahkan masukkan Satuan" }),
  pricePerUnit: z.number().positive({ message: " Silahkan masukkan Harga" }),
});

const FoodForm = ({ initialData, onSuccess, className }: FoodFormProps) => {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      unit: initialData?.unit ?? "",
      pricePerUnit: initialData?.price_per_unit ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        unit: value.unit,
        pricePerUnit: value.pricePerUnit,
      };
      console.log(value);

      try {
        const url = initialData ? `/food/${initialData.id}` : `/food`;
        const method = initialData ? "patch" : "post";

        const res = await api[method](url, payload);
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
      const res = await api.delete(`/food/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus data makanan");
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
          <Label htmlFor="name">Nama Makanan</Label>
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
          <Label htmlFor="pricePerUnit">Harga per Satuan</Label>
        </div>
        <div className="col-span-3 row-start-3">
          <form.Field name="pricePerUnit">
            {(field) => {
              return (
                <div>
                  <div className="flex items-center gap-x-2">
                    <p>Rp </p>
                    <Input
                      type="text"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      id="pricePerUnit"
                    />
                  </div>
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

export default FoodForm;
