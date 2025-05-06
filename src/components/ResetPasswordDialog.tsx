import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useForm } from "@tanstack/react-form";
import axios from "axios";
import toast from "react-hot-toast";

interface ResetPasswordDialogProps {
  user: User;
  onConfirm: () => void;
}

const ResetPasswordDialog = ({ user, onConfirm }: ResetPasswordDialogProps) => {
  const form = useForm({
    defaultValues: {},
    onSubmit: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      try {
        const url = `${baseUrl}/user/${user.id}/actions/reset-password`;
        const res = await axios.post(url);
        console.log(res.data.data);
        onConfirm();
        toast.success(`Berhasil reset password`);
      } catch (err) {
        console.error(err);
        toast.error(String(err));
      }
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" onClick={(e) => e.stopPropagation()}>
          Reset Password
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Reset password pada akun {user.username} - {user.name}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            Ya, saya yakin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetPasswordDialog;
