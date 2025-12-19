import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { type Product } from "@shared/schema";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

interface ProductDialogProps {
  mode: "create" | "edit";
  product?: Product;
  trigger?: React.ReactNode;
}

export function ProductDialog({ mode, product, trigger }: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isEdit = mode === "edit";
  const mutation = isEdit ? updateMutation : createMutation;

  const handleSubmit = (data: any) => {
    if (isEdit && product) {
      mutation.mutate({ id: product.id, ...data }, {
        onSuccess: () => setOpen(false),
      });
    } else {
      mutation.mutate(data, {
        onSuccess: () => setOpen(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 rounded-xl transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 sm:p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-display font-bold">
            {isEdit ? "Edit Product" : "Create New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Make changes to your product here. Click save when you're done."
              : "Add a new product to your catalog. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={product}
          onSubmit={handleSubmit}
          isPending={mutation.isPending}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
