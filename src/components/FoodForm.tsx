import { cn } from "@/lib/utils";
import { useForm, useStore } from "@tanstack/react-form";
import React from "react";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Combobox, Option } from "./ui/combobox";
import { Button } from "./ui/button";
import { PlusIcon, Save, Trash, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

interface FoodFormProps {
  initialData?: Food;
  foodMaterials: FoodMaterial[];
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onSuccess: () => void;
  className?: string;
}

const foodMaterialUsagesSchema = z.object({
  foodMaterialID: z.number({ message: "Silahkan pilih bahan makanan" }),
  quantityUsed: z.coerce
    .number()
    .positive({ message: "Jumlah harus lebih dari 0" }),
});

const formSchema = z.object({
  name: z.string().min(1, { message: "Silahkan masukkan nama makanan" }),
  foodMaterialUsages: z
    .array(foodMaterialUsagesSchema)
    .min(1, { message: "Minimal harus ada satu bahan makanan" }),
});

const FoodForm = ({
  initialData,
  foodMaterials,
  onSuccess,
  className,
  dialogOpen,
  setDialogOpen,
}: FoodFormProps) => {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                {initialData ? "Edit Makanan" : "Tambah Makanan"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <Form
              initialData={initialData}
              foodMaterials={foodMaterials}
              onSuccess={onSuccess}
              className={className}
            />
            <DrawerFooter className="pt-2"></DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>
                {initialData ? "Edit Makanan" : "Tambah Makanan"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <Form
              initialData={initialData}
              foodMaterials={foodMaterials}
              onSuccess={onSuccess}
              className={className}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const Form = ({
  initialData,
  foodMaterials,
  onSuccess,
  className,
}: {
  initialData?: Food;
  foodMaterials: FoodMaterial[];
  onSuccess: () => void;
  className?: string;
}) => {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      foodMaterialUsages:
        initialData?.foodMaterialUsages.map((usage) => ({
          foodMaterialID: usage.foodMaterialID,
          quantityUsed: usage.quantityUsed,
        })) ?? [],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        foodMaterialUsages: value.foodMaterialUsages.map((usage) => ({
          foodMaterialID: usage.foodMaterialID,
          quantityUsed: usage.quantityUsed,
        })),
      };
      console.log(payload);

      try {
        const url = initialData
          ? `/admin/food/${initialData.id}`
          : `/admin/food`;
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
      const res = await api.delete(`/admin/food/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus data makanan");
      onSuccess();
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const foodOptions: Option[] = foodMaterials.map((fm) => ({
    value: fm.id.toString(),
    label: fm.name,
  }));

  const foodMaterialUsages = useStore(
    form.store,
    (s) => s.values.foodMaterialUsages ?? [],
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("", className)}
    >
      <div className="grid auto-rows-auto grid-cols-4 items-center gap-y-4">
        <Label className="">Nama</Label>
        <form.Field name="name">
          {(field) => (
            <div className="col-span-3">
              <Input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                id="unit"
              />
              {!field.state.meta.isValid && (
                <p className="text-[10px] text-red-500">
                  {field.state.meta.errors
                    .map((err) => err?.message)
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <Label className="col-span-4">Bahan makanan &#58;</Label>
        {foodMaterialUsages.map((field, index) => (
          <div key={index} className="col-span-4 flex gap-x-2">
            <div className="grid grid-cols-24 items-center justify-between gap-x-2">
              <p className="bg-primary col-span-2 rounded-sm text-center">
                {index + 1}
              </p>
              <form.Field name={`foodMaterialUsages[${index}].foodMaterialID`}>
                {(field) => (
                  <>
                    <Combobox
                      options={foodOptions}
                      value={field.state.value.toString()}
                      onChange={(value) => field.handleChange(Number(value))}
                      className="col-span-13 w-full"
                      placeholder="Pilih bahan makanan"
                    />
                  </>
                )}
              </form.Field>

              <form.Field name={`foodMaterialUsages[${index}].quantityUsed`}>
                {(field) => (
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    id="unit"
                    className="col-span-5"
                  />
                )}
              </form.Field>
              <p className="col-span-3 text-xs">
                {
                  foodMaterials.find((fm) => fm.id === field.foodMaterialID)
                    ?.unit
                }
              </p>
              <Button
                type="button"
                variant="destructive"
                className="col-span-1"
                onClick={() => {
                  const updated = [...foodMaterialUsages];
                  updated.splice(index, 1);
                  form.setFieldValue("foodMaterialUsages", updated);
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="col-span-4 ml-[38px] flex w-[100px]"
          onClick={() => {
            const current = form.getFieldValue("foodMaterialUsages") || [];
            form.setFieldValue("foodMaterialUsages", [
              ...current,
              {
                foodMaterialID: 0,
                quantityUsed: 0,
              },
            ]);
          }}
        >
          <PlusIcon />
          Tambah
        </Button>

        {initialData ? (
          <div className="col-span-4 mt-8 flex justify-between">
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
          <div className="col-span-4 mt-8 flex justify-end">
            <Button type="submit" className="">
              <Save />
              Simpan
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default FoodForm;
