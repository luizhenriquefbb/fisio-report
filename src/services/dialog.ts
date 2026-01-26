import Swal, { SweetAlertIcon } from "sweetalert2";

interface DialogOptions {
  title?: string;
  kind?: "info" | "warning" | "error" | "success";
}

export const message = async (
  text: string,
  options?: DialogOptions | string,
) => {
  const title = typeof options === "object" ? options.title : undefined;
  let icon: SweetAlertIcon = "info";

  if (typeof options === "object" && options.kind) {
    if (options.kind === "warning") icon = "warning";
    else if (options.kind === "error") icon = "error";
    else if (options.kind === "success") icon = "success";
  }

  await Swal.fire({
    title:
      title ||
      (icon === "error"
        ? "Erro"
        : icon === "success"
          ? "Sucesso"
          : "Informação"),
    text: text,
    icon: icon,
    confirmButtonColor: "#52a397",
  });
};

export const confirm = async (
  text: string,
  options?: DialogOptions | string,
): Promise<boolean> => {
  const title = typeof options === "object" ? options.title : "Confirmar";
  let icon: SweetAlertIcon = "question";

  if (typeof options === "object" && options.kind) {
    if (options.kind === "warning") icon = "warning";
    else if (options.kind === "error") icon = "error";
  }

  const result = await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: "#52a397",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};
