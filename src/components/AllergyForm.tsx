import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import React from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Save, Trash } from "lucide-react";
import { isAxiosError } from "axios";

interface AllergyFormProps {
  initialData?: Allergy;
  onSuccess: () => void;
  className?: string;
}

const formSchema = z.object({
  code: z.string().min(1, { message: " Silahkan masukkan kode diet" }),
  name: z.string().min(1, { message: " Silahkan masukkan nama diet" }),
});

const AllergyForm = ({
  initialData,
  onSuccess,
  className,
}: AllergyFormProps) => {
  const form = useForm({
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        code: value.code,
        name: value.name,
      };
      try {
        const url = initialData
          ? `/admin/allergy/${initialData.id}`
          : `/admin/allergy`;
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
      const res = await api.delete(`/admin/allergy/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus data alergi");
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
      <div className="grid grid-cols-4 grid-rows-2 items-center gap-4 gap-x-2">
        <div>
          <Label htmlFor="name">Kode Alergi</Label>
        </div>
        <div className="col-span-3 max-h-[40px]">
          <form.Field name="code">
            {(field) => (
              <div>
                <Input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id="name"
                  placeholder="Kode alergi..."
                />
                {field.state.meta.isValid &&
                  field.state.meta.errors.map((err, idx) => (
                    <p key={idx} className="text-[10px] text-red-500">
                      {err?.message}
                    </p>
                  ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <Label htmlFor="name">Nama diet</Label>
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
                  placeholder="Nama alergi..."
                />
                {field.state.meta.isValid &&
                  field.state.meta.errors.map((err, idx) => (
                    <p key={idx} className="text-[10px] text-red-500">
                      {err?.message}
                    </p>
                  ))}
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

export default AllergyForm;
