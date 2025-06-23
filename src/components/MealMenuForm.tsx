import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import { z } from "zod";
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
import { useForm } from "@tanstack/react-form";
import MultipleSelector, { Option } from "./ui/multi-select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Save, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

interface MealMenuFormProps {
  initialData?: MealMenu;
  foods: Food[];
  mealTypes: MealType[];
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onSuccess: () => void;
  className?: string;
}

const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

const time = ["pagi", "siang", "sore"];

const formSchema = z.object({
  name: z.string().min(1, { message: "Silahkan masukkan nama menu" }),
  day: z.string().min(1, { message: "Silahkan masukkan hari menu diberikan" }),
  time: z
    .string()
    .min(1, { message: "Silahkan masukkan waktu menu diberikan" }),
  mealTypeID: z.number({ message: "Silahkan pilih Jenis Makanan" }),
  foodIDs: z.array(z.number()),
});

const MealMenuForm = ({
  initialData,
  foods,
  mealTypes,
  dialogOpen,
  setDialogOpen,
  onSuccess,
  className,
}: MealMenuFormProps) => {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? (
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                {initialData ? "Edit Menu" : "Tambah Menu"}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <Form
              initialData={initialData}
              foods={foods}
              mealTypes={mealTypes}
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
                {initialData ? "Edit Menu" : "Tambah Menu"}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <Form
              initialData={initialData}
              foods={foods}
              mealTypes={mealTypes}
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
  foods,
  mealTypes,
  onSuccess,
  className,
}: {
  initialData?: MealMenu;
  foods: Food[];
  mealTypes: MealType[];
  onSuccess: () => void;
  className?: string;
}) => {
  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      day: initialData?.day ?? "",
      time: initialData?.time ?? "",
      mealTypeID: initialData?.mealTypeID ?? "",
      foodIDs: initialData?.foods.map((food) => food.id) ?? [],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        day: value.day,
        time: value.time,
        mealTypeID: value.mealTypeID,
        foodIDs: value.foodIDs,
      };
      console.log(payload);
      try {
        const url = initialData
          ? `/admin/meal-menu/${initialData.id}`
          : `/admin/meal-menu`;
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
      const res = await api.delete(`/admin/meal-menu/${id}`);
      console.log(res.status);
      toast.success("Berhasil menghapus menu");
      onSuccess();
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(String(err.response?.data.error));
      }
      console.error(err);
    }
  };

  const foodOptions: Option[] = foods.map((food) => ({
    value: food.id.toString(),
    label: food.name,
  }));

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
                placeholder="Nama..."
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

        <Label>Hari</Label>
        <form.Field name="day">
          {(field) => (
            <div className="col-span-3">
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hari..." />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <Label>Waktu</Label>
        <form.Field name="time">
          {(field) => (
            <div className="col-span-3">
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Waktu..." />
                </SelectTrigger>
                <SelectContent>
                  {time.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <Label>Jenis makanan</Label>
        <form.Field name="mealTypeID">
          {(field) => (
            <div className="col-span-3">
              <Select
                value={field.state.value.toString()}
                onValueChange={(value) => field.handleChange(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis makanan" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((mt) => (
                    <SelectItem key={mt.id} value={mt.id.toString()}>
                      {mt.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <Label>Daftar makanan</Label>
        <form.Field name="foodIDs">
          {(field) => (
            <div className="col-span-3">
              <MultipleSelector
                value={
                  field.state.value.map((foodID) => ({
                    value: foodID.toString(),
                    label: foods.find((food) => food.id === foodID)?.name,
                  })) as Option[]
                }
                onChange={(options) =>
                  field.handleChange(options.map((opt) => Number(opt.value)))
                }
                defaultOptions={foodOptions}
                placeholder="Pilih makanan untuk menu..."
                hidePlaceholderWhenSelected
              />
            </div>
          )}
        </form.Field>

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
export default MealMenuForm;
