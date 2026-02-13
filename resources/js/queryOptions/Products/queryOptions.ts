import { Product, stocks } from "@/Pages/Auth/Admin/Products/Index";
import { queryOptions } from "@tanstack/react-query"


export const productQueryOptions = ({ selectedProductForStock, reset }: { selectedProductForStock: Product | null, reset: () => void }) => queryOptions(
    {
        queryKey: ['stocks', selectedProductForStock?.id],
        queryFn: async (): Promise<stocks[]> => {
            reset();
            if (!selectedProductForStock) return [];
            const response = await fetch(`/api/admin/products/stocks/${selectedProductForStock.id}`, {
                credentials: 'include', // Send cookies with request
                headers: {
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
    }
)